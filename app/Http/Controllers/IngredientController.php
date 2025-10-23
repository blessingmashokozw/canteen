<?php

namespace App\Http\Controllers;

use App\Models\Ingredient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class IngredientController extends Controller
{
    /**
     * Display a listing of all ingredients with stock levels.
     */
    public function index(): Response
    {
        $ingredients = Ingredient::orderBy('name')->get();

        // Get ingredients that are low on stock
        $lowStockIngredients = Ingredient::whereRaw('stock_quantity <= low_stock_threshold')
            ->where('stock_quantity', '>', 0)
            ->orderByRaw('stock_quantity / low_stock_threshold ASC')
            ->get();

        // Get out of stock ingredients
        $outOfStockIngredients = Ingredient::where('stock_quantity', '<=', 0)
            ->orderBy('name')
            ->get();

        return Inertia::render('ingredients/index', [
            'ingredients' => $ingredients,
            'lowStockIngredients' => $lowStockIngredients,
            'outOfStockIngredients' => $outOfStockIngredients,
        ]);
    }

    /**
     * Store a newly created ingredient.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:ingredients,name'],
            'unit' => ['required', 'string', 'max:20'],
            'stock_quantity' => ['required', 'numeric', 'min:0'],
            'low_stock_threshold' => ['required', 'numeric', 'min:0'],
        ]);

        Ingredient::create($validated);

        return back()->with('success', 'Ingredient created successfully');
    }

    /**
     * Update ingredient stock quantity.
     */
    public function updateStock(Request $request, Ingredient $ingredient): RedirectResponse
    {
        $validated = $request->validate([
            'stock_quantity' => ['required', 'numeric', 'min:0'],
            'low_stock_threshold' => ['required', 'numeric', 'min:0'],
        ]);

        $ingredient->update([
            'stock_quantity' => $validated['stock_quantity'],
            'low_stock_threshold' => $validated['low_stock_threshold'],
        ]);

        $status = $ingredient->fresh()->getStockStatus();
        return back()->with('success', "Ingredient stock updated successfully. Current status: {$status}");
    }

    /**
     * Add stock to an ingredient (restock).
     */
    public function addStock(Request $request, Ingredient $ingredient): RedirectResponse
    {
        $validated = $request->validate([
            'quantity' => ['required', 'numeric', 'min:0.01'],
        ]);

        $ingredient->addStock($validated['quantity']);

        $status = $ingredient->fresh()->getStockStatus();
        return back()->with('success', "Added {$validated['quantity']} {$ingredient->unit} to stock. Current status: {$status}");
    }

    /**
     * Show ingredients that are low on stock.
     */
    public function lowStock(): Response
    {
        $lowStockIngredients = Ingredient::whereRaw('stock_quantity <= low_stock_threshold')
            ->where('stock_quantity', '>', 0)
            ->orderByRaw('stock_quantity / low_stock_threshold ASC')
            ->get();

        return Inertia::render('ingredients/low-stock', [
            'lowStockIngredients' => $lowStockIngredients,
        ]);
    }

    /**
     * Show out of stock ingredients.
     */
    public function outOfStock(): Response
    {
        $outOfStockIngredients = Ingredient::where('stock_quantity', '<=', 0)
            ->orderBy('name')
            ->get();

        return Inertia::render('ingredients/out-of-stock', [
            'outOfStockIngredients' => $outOfStockIngredients,
        ]);
    }
}
