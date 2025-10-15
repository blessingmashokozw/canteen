<?php

namespace App\Http\Controllers;

use App\Models\Meal;
use App\Models\Order;
use App\Models\OrderItem;
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
        $order->load(['orderItems.meal', 'user']);

        return redirect()->route('orders.show', $order->id)
            ->with('success', 'Order created successfully');
    }

    /**
     * Display the specified order.
     */
    public function show(Order $order): Response
    {
        $order->load(['orderItems.meal', 'user']);

        return Inertia::render('orders/show', [
            'order' => $order,
        ]);
    }

    /**
     * Display a listing of orders with filters.
     */
    public function index(Request $request): Response
    {
        $query = Order::with(['orderItems.meal', 'user']);

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

        // Currently showing only user's orders, but this could be extended for admin
        $query->where('user_id', $request->user()->id);

        $orders = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('orders/index', [
            'orders' => $orders,
            'filters' => $request->only(['search', 'date_from', 'date_to', 'payment_method']),
        ]);
    }
}
