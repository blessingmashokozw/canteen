<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use Paynow\Payments\Paynow;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class PaymentController extends Controller
{
    /**
     * Display a listing of all payments with filters.
     */
    public function index(Request $request): InertiaResponse
    {
        $query = Payment::with(['order' => function ($query) {
            $query->select(['id', 'user_id', 'status', 'order_code', 'created_at']);
        }, 'order.user']);

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Filter by payment status
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by payment method
        if ($request->filled('payment_method') && $request->payment_method !== 'all') {
            $query->where('payment_method', $request->payment_method);
        }

        // Filter by amount range
        if ($request->filled('amount_from')) {
            $query->where('amount', '>=', $request->amount_from);
        }

        if ($request->filled('amount_to')) {
            $query->where('amount', '<=', $request->amount_to);
        }

        $payments = $query->latest()->paginate(20)->withQueryString();

        // Get summary statistics
        $stats = [
            'total_payments' => Payment::count(),
            'total_amount' => (float) Payment::where('status', 'paid')->sum('amount'),
            'paid_payments' => Payment::where('status', 'paid')->count(),
            'pending_payments' => Payment::where('status', 'pending')->count(),
            'failed_payments' => Payment::where('status', 'failed')->count(),
        ];

        return Inertia::render('payments/index', [
            'payments' => $payments,
            'stats' => $stats,
            'filters' => $request->only([
                'date_from', 'date_to', 'status', 'payment_method',
                'amount_from', 'amount_to'
            ]),
        ]);
    }

    /**
     * Initiate payment for an order.
     */
    public function pay(Order $order)
    {
        // Only allow payment for confirmed orders
        if ($order->status !== 'confirmed') {
            abort(403, 'Payment can only be initiated for confirmed orders.');
        }
        // Only allow payment for the order owner
        if ($order->user_id !== auth()->id()) {
            abort(403, 'You can only pay for your own orders.');
        }

        $paymentMethod = request('method', 'paynow');

        if ($paymentMethod === 'paynow') {
            try {
                // Initialize PayNow
                $paynow = new Paynow(
                    env('PAYNOW_INTEGRATION_ID'),
                    env('PAYNOW_INTEGRATION_KEY'),
                    route('orders.show', ['order' => $order->id, 'poll' => 'true']), // return url
                    route('payments.callback') // result url
                );

                // Create payment
                $auth_email = "mashcom.freelancing@gmail.com";//$order->user->email;
                $payment = $paynow->createPayment($order->id, $auth_email);

                // Add items to payment
                foreach ($order->orderItems as $item) {
                    //dd($item);
                    if ($item->is_available) {
                        $payment->add($item->meal->name, $item->price* $item->quantity, $item->quantity, $item->meal->name);
                    }
                }

              //  dd($payment);

                // Send payment to PayNow
                $response = $paynow->send($payment);

                if (method_exists($response, 'success') ? $response->success() : $response->isSuccessful()) {
                    // Generate unique hash for this payment
                    $paymentHash = Str::uuid()->toString();

                    // Get the payment link and poll URL
                    $paymentLink = method_exists($response, 'redirectUrl') ? $response->redirectUrl() : $response->getRedirectUrl();
                    $pollUrl = method_exists($response, 'pollUrl') ? $response->pollUrl() : $response->getPollUrl();

                    // Save payment record
                    Payment::create([
                        'order_id' => $order->id,
                        'payment_method' => 'paynow',
                        'amount' => $order->available_total,
                        'payment_url' => $paymentLink,
                        'poll_url' => $pollUrl,
                        'hash' => $paymentHash,
                        'status' => 'pending',
                        'paynow_response' => json_encode($response),
                    ]);

                    return Inertia::render('orders/pay', [
                        'order' => $order,
                        'payment_method' => $paymentMethod,
                        'amount' => $order->available_total,
                        'payment_url' => $paymentLink,
                        'reference' => $order->id,
                    ]);
                }

                // Payment creation failed
                Log::error('PayNow payment creation failed', [
                    'order_id' => $order->id,
                    'response' => method_exists($response, 'getError') ? $response->getError() : 'Unknown error',
                ]);

                return back()->withErrors(['payment' => 'Failed to create payment. Please try again.']);

            } catch (\Exception $e) {
                Log::error('PayNow payment error', [
                    'order_id' => $order->id,
                    'error' => $e->getMessage(),
                ]);

                return back()->withErrors(['payment' => 'Payment service unavailable. Please try again.']);
            }
        }

        abort(400, 'Unsupported payment method.');
    }

    /**
     * Handle PayNow callback/webhook
     */
    public function callback(Request $request)
    {
        try {
            // Initialize PayNow to verify the callback
            $paynow = new Paynow(
                env('PAYNOW_INTEGRATION_ID'),
                env('PAYNOW_INTEGRATION_KEY')
            );

            // Verify the callback
            if (!$paynow->verify($request->all())) {
                Log::warning('PayNow callback verification failed', [
                    'data' => $request->all(),
                ]);
                return response()->json(['error' => 'Invalid callback'], 400);
            }

            $reference = $request->input('reference');
            $status = $request->input('status');

            // Find the payment by reference (order_id)
            $payment = Payment::where('order_id', $reference)->first();

            if (!$payment) {
                Log::warning('Payment not found for PayNow callback', [
                    'reference' => $reference,
                ]);
                return response()->json(['error' => 'Payment not found'], 404);
            }

            // Update payment status based on PayNow status
            switch ($status) {
                case 'paid':
                    $payment->update([
                        'status' => 'paid',
                        'paid_at' => now(),
                    ]);

                    // Update order status to ready for collection
                    $payment->order->update(['status' => 'ready']);

                    Log::info("Payment completed for order #{$payment->order_id}", [
                        'payment_id' => $payment->id,
                        'amount' => $request->input('amount'),
                    ]);
                    break;

                case 'cancelled':
                    $payment->update([
                        'status' => 'cancelled',
                    ]);

                    Log::info("Payment cancelled for order #{$payment->order_id}", [
                        'payment_id' => $payment->id,
                    ]);
                    break;

                default:
                    Log::info("Payment status updated for order #{$payment->order_id}", [
                        'payment_id' => $payment->id,
                        'status' => $status,
                    ]);
                    break;
            }

            return response()->json(['status' => 'success']);

        } catch (\Exception $e) {
            Log::error('PayNow callback error', [
                'error' => $e->getMessage(),
                'data' => $request->all(),
            ]);

            return response()->json(['error' => 'Callback processing failed'], 500);
        }
    }
}
