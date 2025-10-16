<?php

namespace App\Http\Controllers;

use App\Models\Meal;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    /**
     * Display the order creation form.
     */
    public function create(): Response
    {
        $meals = Meal::orderBy('name')->get();

        return Inertia::render('orders/create', [
            'meals' => $meals,
        ]);
    }

    /**
     * Store a newly created order.
     */
    public function store(Request $request): RedirectResponse
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
    public function show(Order $order): Response
    {
        // Ensure status field is loaded
        if (!$order->relationLoaded('orderItems')) {
            $order->load(['orderItems' => function ($query) {
                $query->select(['id', 'order_id', 'meal_id', 'status_id', 'price', 'quantity', 'is_available', 'created_at', 'updated_at']);
            }, 'orderItems.meal', 'user']);
        }

        // Set default status if not set
        if (is_null($order->status)) {
            $order->status = 'pending';
            $order->save();
        }

        return Inertia::render('orders/show', [
            'order' => $order,
            'flash' => [
                'availability_success' => session('availability_success'),
                'confirmation_success' => session('confirmation_success'),
            ],
        ]);
    }

    /**
     * Display a listing of orders with filters.
     */
    public function index(Request $request): Response
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

        // Currently showing only user's orders, but this could be extended for admin
        $query->where('user_id', $request->user()->id);

        $orders = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('orders/index', [
            'orders' => $orders,
            'filters' => $request->only(['search', 'date_from', 'date_to', 'payment_method', 'status']),
        ]);
    }

    /**
     * Confirm availability of an order item.
     */
    public function confirmAvailability(Request $request, Order $order, OrderItem $orderItem): RedirectResponse
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
    public function confirm(Order $order): RedirectResponse
    {
        // Only allow confirmation if order is in pending status
        if ($order->status !== 'pending') {
            return back()->withErrors(['confirmation' => 'Order cannot be confirmed in its current status']);
        }

        $order->update([
            'status' => 'confirmed',
        ]);

        return back()->with('confirmation_success', 'Order has been confirmed successfully');
    }
}
