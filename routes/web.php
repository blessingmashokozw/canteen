<?php

use App\Http\Controllers\CollectionSlotController;
use App\Http\Controllers\MealController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\IngredientController;
use Inertia\Inertia;
use App\Models\Meal;

Route::get('/', function () {
    $user = auth()->user();

    // If user is authenticated and is a customer, redirect to create order
    if ($user && $user->role === 'customer') {
        return redirect()->route('orders.create');
    }

    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        $user = auth()->user();

        // Redirect customers to create order page
        if ($user && $user->role === 'customer') {
            return redirect()->route('orders.create');
        }

        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('/meals', function () {
        $user = auth()->user();

        // Only admins and kitchen staff can access meals management
        if (!$user || !in_array($user->role, ['admin', 'kitchen'])) {
            abort(403, 'Access denied. Meals management is restricted to administrators and kitchen staff.');
        }

        return app(MealController::class)->index();
    })->name('meals.index');

    Route::post('/meals', function (Request $request) {
        $user = auth()->user();

        // Only admins and kitchen staff can create meals
        if (!$user || !in_array($user->role, ['admin', 'kitchen'])) {
            abort(403, 'Access denied. Meal creation is restricted to administrators and kitchen staff.');
        }

        return app(MealController::class)->store($request);
    })->name('meals.store');

    Route::patch('/meals/{meal}/price', function (Request $request, Meal $meal) {
        $user = auth()->user();

        // Only admins and kitchen staff can update meal prices
        if (!$user || !in_array($user->role, ['admin', 'kitchen'])) {
            abort(403, 'Access denied. Price updates are restricted to administrators and kitchen staff.');
        }

        return app(MealController::class)->updatePrice($request, $meal);
    })->name('meals.updatePrice');

    Route::patch('/meals/{meal}/stock', function (Request $request, Meal $meal) {
        $user = auth()->user();

        // Only admins and kitchen staff can update stock
        if (!$user || !in_array($user->role, ['admin', 'kitchen'])) {
            abort(403, 'Access denied. Stock management is restricted to administrators and kitchen staff.');
        }

        return app(MealController::class)->updateStock($request, $meal);
    })->name('meals.updateStock');

    Route::post('/meals/{meal}/add-stock', function (Request $request, Meal $meal) {
        $user = auth()->user();

        // Only admins and kitchen staff can add stock
        if (!$user || !in_array($user->role, ['admin', 'kitchen'])) {
            abort(403, 'Access denied. Stock management is restricted to administrators and kitchen staff.');
        }

        return app(MealController::class)->addStock($request, $meal);
    })->name('meals.addStock');

    
    Route::get('/ingredients', [IngredientController::class, 'index'])->name('ingredients.index');
    Route::post('/ingredients', [IngredientController::class, 'store'])->name('ingredients.store');
    Route::patch('/ingredients/{ingredient}/stock', [IngredientController::class, 'updateStock'])->name('ingredients.updateStock');
    Route::post('/ingredients/{ingredient}/add-stock', [IngredientController::class, 'addStock'])->name('ingredients.addStock');
    Route::get('/ingredients/low-stock', [IngredientController::class, 'lowStock'])->name('ingredients.lowStock');
    Route::get('/meals/low-stock', [MealController::class, 'lowStockMeals'])->name('meals.lowStock');

    // Meal ingredients routes
    Route::get('/meals/{meal}/ingredients', [MealController::class, 'showIngredients'])->name('meals.ingredients');
    Route::post('/meals/{meal}/ingredients', [MealController::class, 'addIngredient'])->name('meals.ingredients.store');
    Route::patch('/meals/{meal}/ingredients/{ingredient}', [MealController::class, 'updateIngredient'])->name('meals.ingredients.update');
    Route::delete('/meals/{meal}/ingredients/{ingredient}', [MealController::class, 'removeIngredient'])->name('meals.ingredients.destroy');

    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/create', [OrderController::class, 'create'])->name('orders.create');
    Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');
    Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show');
    Route::post('/orders/{order}/confirm', [OrderController::class, 'confirm'])->name('orders.confirm');
    Route::post('/orders/{order}/assign-slot', [OrderController::class, 'assignSlot'])->name('orders.assign-slot');
    Route::post('/orders/{order}/mark-delivered', [OrderController::class, 'markDelivered'])->name('orders.mark-delivered');
    Route::post('/orders/{order}/mark-completed', [OrderController::class, 'markAsCompleted'])->name('orders.mark-completed');
    Route::get('/orders/{order}/pay', [PaymentController::class, 'pay'])->name('orders.pay');
    Route::post('/payments/callback', [PaymentController::class, 'callback'])->name('payments.callback');
    Route::get('/payments', [PaymentController::class, 'index'])->name('payments.index');
    Route::post('/orders/{order}/items/{orderItem}/confirm-availability', [OrderController::class, 'confirmAvailability'])->name('orders.items.confirm-availability');
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::post('/users', [UserController::class, 'store'])->name('users.store');
    Route::get('/users/{user}', [UserController::class, 'show'])->name('users.show');

    Route::get('/collection-slots', [CollectionSlotController::class, 'index'])->name('collection-slots.index');
    Route::get('/collection-slots/create', [CollectionSlotController::class, 'create'])->name('collection-slots.create');
    Route::post('/collection-slots', [CollectionSlotController::class, 'store'])->name('collection-slots.store');
    Route::get('/collection-slots/{slot}/edit', [CollectionSlotController::class, 'edit'])->name('collection-slots.edit');
    Route::put('/collection-slots/{slot}', [CollectionSlotController::class, 'update'])->name('collection-slots.update');
    Route::delete('/collection-slots/{slot}', [CollectionSlotController::class, 'destroy'])->name('collection-slots.destroy');

});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
