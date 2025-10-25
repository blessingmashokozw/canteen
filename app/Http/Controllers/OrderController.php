<?php

namespace App\Http\Controllers;

use App\Models\Meal;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Paynow\Payments\Paynow;
use Inertia\Inertia;
use App\Models\CollectionSlot;
use App\Models\Ingredient;
use App\Models\MealIngredient;

class OrderController extends Controller
{
    /**
     * Display the order creation form.
     */
    public function create()
    {
        $meals = Meal::orderBy('name')->get();

        return Inertia::render('orders/create', [
            'meals' => $meals,
        ]);
    }

    /**
     * Store a newly created order.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'instructions' => ['nullable', 'string', 'max:250'],
            'payment_method' => ['required', 'in:CASH,ONLINE_PAYMENT'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.meal_id' => ['required', 'exists:meals,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        // Create the order
        $order = Order::create([
            'user_id' => $request->user()->id,
            'instructions' => $validated['instructions'] ?? null,
            'payment_method' => $validated['payment_method'],
            'status' => 'pending',
        ]);

        // Create order items
        foreach ($validated['items'] as $item) {
            $meal = Meal::findOrFail($item['meal_id']);

            OrderItem::create([
                'order_id' => $order->id,
                'meal_id' => $meal->id,
                'status_id' => 1, // Default status (you may want to adjust this)
                'price' => $meal->price,
                'quantity' => $item['quantity'],
            ]);
        }

        // Reload the order with relationships for the redirect
        $order->load(['orderItems' => function ($query) {
            $query->select(['id', 'order_id', 'meal_id', 'status_id', 'price', 'quantity', 'is_available', 'created_at', 'updated_at']);
        }, 'orderItems.meal', 'user']);

        return redirect()->route('orders.show', $order->id)
            ->with('success', 'Order created successfully');
    }

    /**
     * Display the specified order.
     */
    public function show(Request $request, Order $order)
    {

        
        $order->load(['orderItems' => function ($query) {
            $query->select(['id', 'order_id', 'meal_id', 'status_id', 'price', 'quantity', 'is_available', 'created_at', 'updated_at']);
        }, 'orderItems.meal', 'user', 'collectionSlot', 'payments']);

        // Set default status if not set
        if (is_null($order->status)) {
            $order->status = 'pending';
            $order->save();
        }

        
        if ($request->poll) {
           
            $poll = $this->pollPaymentStatus($request, $order);
            //dd($poll);
        }
        return Inertia::render('orders/show', [
            'order' => $order,
            'user' => [
                'is_admin' => $request->user()->isAdmin(),
                'is_kitchen' => $request->user()->isKitchen(),
                'role' => $request->user()->role,
            ],
            'flash' => [
                'availability_success' => session('availability_success'),
                'confirmation_success' => session('confirmation_success'),
            ],
        ]);
    }

    /**
     * Display a listing of orders with filters.
     */
    public function index(Request $request)
    {
        $query = Order::with(['orderItems' => function ($query) {
            $query->select(['id', 'order_id', 'meal_id', 'status_id', 'price', 'quantity', 'is_available', 'created_at', 'updated_at']);
        }, 'orderItems.meal', 'user']);

        // Search by user name or email (for admin view, but currently showing user orders only)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by specific order ID
        if ($request->filled('order_id')) {
            $query->where('id', $request->order_id);
        }

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Filter by payment method
        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Currently showing only user's orders, but this could be extended for admin/kitchen staff to see all orders
        if (!$request->user()->isAdmin() && !$request->user()->isKitchen()) {
            $query->where('user_id', $request->user()->id);
        }

        $orders = $query->latest()->paginate(10)->withQueryString();

        // Get summary statistics - show all orders for admin/kitchen staff, user orders for customers
        $userId = ($request->user()->isAdmin() || $request->user()->isKitchen()) ? null : $request->user()->id;

        $stats = [
            'total_orders' => Order::when($userId, fn($query) => $query->where('user_id', $userId))->count(),
            'pending_orders' => Order::when($userId, fn($query) => $query->where('user_id', $userId))->where('status', 'pending')->count(),
            'confirmed_orders' => Order::when($userId, fn($query) => $query->where('user_id', $userId))->where('status', 'confirmed')->count(),
            'preparing_orders' => Order::when($userId, fn($query) => $query->where('user_id', $userId))->where('status', 'preparing')->count(),
            'ready_orders' => Order::when($userId, fn($query) => $query->where('user_id', $userId))->where('status', 'ready')->count(),
            'completed_orders' => Order::when($userId, fn($query) => $query->where('user_id', $userId))->where('status', 'completed')->count(),
            'cancelled_orders' => Order::when($userId, fn($query) => $query->where('user_id', $userId))->where('status', 'cancelled')->count(),
            'total_amount' => Order::when($userId, fn($query) => $query->where('user_id', $userId))
                ->with('orderItems')
                ->get()
                ->sum(function ($order) {
                    return $order->orderItems->sum(function ($item) {
                        return $item->price * $item->quantity;
                    });
                }),
        ];

        return Inertia::render('orders/index', [
            'orders' => $orders,
            'stats' => $stats,
            'filters' => $request->only(['search', 'order_id', 'date_from', 'date_to', 'payment_method', 'status']),
        ]);
    }

    /**
     * Confirm availability of an order item.
     */
    public function confirmAvailability(Request $request, Order $order, OrderItem $orderItem)
    {
        // Ensure the order item belongs to the order
        if ($orderItem->order_id !== $order->id) {
            return back()->withErrors(['availability' => 'Order item not found']);
        }

        $validated = $request->validate([
            'available' => ['required', 'boolean'],
        ]);

        // Update the order item's availability
        $orderItem->update([
            'is_available' => $validated['available'],
        ]);

        $message = $validated['available'] ? 'Item marked as available' : 'Item marked as not available';

        return back()->with('availability_success', $message);
    }

    /**
     * Confirm an order.
     */
    public function confirm(Request $request, Order $order)
    {
        // Only admin and kitchen staff can confirm orders
        if (!$request->user()->isAdmin() && !$request->user()->isKitchen()) {
            return back()->withErrors(['confirmation' => 'You do not have permission to confirm orders']);
        }

        // Only allow confirmation if order is in pending status
        if ($order->status !== 'pending') {
            return back()->withErrors(['confirmation' => 'Order cannot be confirmed in its current status']);
        }

        $order->update([
            'status' => 'confirmed',
        ]);

        return back()->with('confirmation_success', 'Order has been confirmed successfully');
    }

    /**
     * Assign a collection slot to an order.
     */
    public function assignSlot(Request $request, Order $order)
    {
        // Only allow slot assignment if order is in ready status
        if ($order->status !== 'ready') {
            return back()->withErrors(['slot_assignment' => 'Only orders that are ready can have collection slots assigned']);
        }

        $validated = $request->validate([
            'collection_slot_id' => ['required', 'exists:collection_slots,id'],
        ]);

        $slot = CollectionSlot::findOrFail($validated['collection_slot_id']);

        // Check if the slot is available
        if (!$slot->isAvailable()) {
            return back()->withErrors(['slot_assignment' => 'Selected collection slot is not available']);
        }

        // Assign the slot to the order and increment booked count
        $order->update([
            'collection_slot_id' => $slot->id,
        ]);

        $slot->increment('booked_count');

        // Reload the order with collection slot data
        $order->load('collectionSlot');

        return back()->with('success', 'Collection slot assigned successfully');
    }

     public function markAsCompleted(Request $request, Order $order)
    {
        // Only allow marking as completed if order is in ready status
        if ($order->status !== 'ready') {
            return back()->withErrors(['completion' => 'Only orders that are ready can be marked as completed']);
        }

        // Only admin and kitchen staff can mark orders as completed
        if (!$request->user()->isAdmin() && !$request->user()->isKitchen()) {
            return back()->withErrors(['completion' => 'You do not have permission to mark orders as completed']);
        }

     

        // Reduce stock for available items in the order (in case it wasn't done during payment)
        $order->load('orderItems.meal');
        
        foreach ($order->orderItems as $orderItem) {
            if ($orderItem->is_available && $orderItem->meal) {
                // Get meal ingredients with quantities required
                $mealIngredients = MealIngredient::where('meal_id', $orderItem->meal_id)->get();

                // Reduce ingredient stock for each ingredient used in this meal
                foreach ($mealIngredients as $mealIngredient) {
                    $ingredient = $mealIngredient->ingredient;

                    if ($ingredient) {
                        // Calculate total quantity needed: order quantity × quantity per meal
                         $totalQuantityNeeded = $orderItem->quantity * $mealIngredient->quantity_required;

                        // // Reduce ingredient stock
                        $ingredient->reduceStock($totalQuantityNeeded);
                  
                        // Log::info("Ingredient stock reduced via order completion", [
                        //     'ingredient_name' => $ingredient->name,
                        //     'quantity_reduced' => $totalQuantityNeeded,
                        //     'remaining_stock' => $ingredient->stock_quantity,
                        //     'meal_name' => $orderItem->meal->name,
                        //     'order_quantity' => $orderItem->quantity,
                        //     'order_id' => $order->id,
                        // ]);

                       
                    }
                }

                // Also reduce the meal stock (this handles the meal-level inventory)
                $orderItem->meal->reduceStock($orderItem->quantity);
                Log::info("Meal stock reduced via order completion", [
                    'meal_name' => $orderItem->meal->name,
                    'quantity_reduced' => $orderItem->quantity,
                    'remaining_stock' => $orderItem->meal->stock_quantity,
                    'order_id' => $order->id,
                ]);
            }
        }
       
        $order->update([
           'status' => 'completed',
        ]);

        return back()->with('success', 'Order has been marked as completed');
    }

    /**
     * Poll payment status for pending payments.
     */
    private function pollPaymentStatus(Request $request, Order $order)
    {
        // Only admin and kitchen staff can poll payment status (since it updates order status)
        // if (!$request->user()->isAdmin() && !$request->user()->isKitchen()) {
        //     return;
        // }

        // Get pending payments for this order
        $pendingPayments = Payment::where('order_id', $order->id)
            ->where('status', 'pending')
            ->whereNotNull('poll_url')
            ->get();

        foreach ($pendingPayments as $payment) {
         
            try {
                // Initialize PayNow for status checking
                $paynow = new Paynow(
                    env('PAYNOW_INTEGRATION_ID'),
                    env('PAYNOW_INTEGRATION_KEY'),
                     route('orders.show', ['order' => $order->id, 'poll' => 'true']), // return url
                    route('payments.callback') // result url
                );

                // Check payment status using poll URL
                $statusResponse = $paynow->pollTransaction($payment->poll_url);

               
                if (method_exists($statusResponse, 'paid') ? $statusResponse->paid() : $statusResponse->isPaid()) {
                    $newStatus = method_exists($statusResponse, 'getStatus') ? $statusResponse->getStatus() : 'paid';

                    // Update payment status
                    $payment->update([
                        'status' => $newStatus,
                        'paynow_response' => json_encode($statusResponse),
                    ]);
                    $order->update([
                            'status' => 'ready',
                            'paid_at' => now(),
                        ]);
                        
                    // Update order status if payment is completed
                    if ($newStatus === 'paid' && $order->status !== 'paid') {
                        

                        Log::info("Order #{$order->id} marked as paid via polling", [
                            'payment_id' => $payment->id,
                            'amount' => $payment->amount,
                        ]);
                    } elseif ($newStatus === 'cancelled' && in_array($order->status, ['pending', 'confirmed'])) {
                        $order->update(['status' => 'cancelled']);

                        Log::info("Order #{$order->id} cancelled via polling", [
                            'payment_id' => $payment->id,
                        ]);
                    }
                }

            } catch (\Exception $e) {
                Log::error("Payment polling failed for order #{$order->id}", [
                    'payment_id' => $payment->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }
}
