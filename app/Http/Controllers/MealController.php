<?php

namespace App\Http\Controllers;

use App\Models\Ingredient;
use App\Models\Meal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MealController extends Controller
{
    /**
     * Display a listing of available meals.
     */
    public function index(): Response
    {
        $meals = Meal::orderBy('name')->get();

        return Inertia::render('meals/index', [
            'meals' => $meals,
        ]);
    }

    /**
     * Store a newly created meal.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:meals,name'],
            'price' => ['required', 'numeric', 'min:0'],
        ]);

        Meal::create($validated);

        return back()->with('success', 'Meal created successfully');
    }

    /**
     * Update the meal price.
     */
    public function updatePrice(Request $request, Meal $meal): RedirectResponse
    {
        $validated = $request->validate([
            'price' => ['required', 'numeric', 'min:0'],
        ]);

        $meal->update([
            'price' => $validated['price'],
        ]);

        return back()->with('success', 'Meal price updated successfully');
    }

    /**
     * Update the meal stock quantity.
     */
    public function updateStock(Request $request, Meal $meal): RedirectResponse
    {
        $validated = $request->validate([
            'stock_quantity' => ['required', 'integer', 'min:0'],
            'low_stock_threshold' => ['required', 'integer', 'min:0'],
        ]);

        $meal->update([
            'stock_quantity' => $validated['stock_quantity'],
            'low_stock_threshold' => $validated['low_stock_threshold'],
        ]);

        $status = $meal->fresh()->getStockStatus();
        return back()->with('success', "Meal stock updated successfully. Current status: {$status}");
    }

    /**
     * Add stock to a meal (restock).
     */
    public function addStock(Request $request, Meal $meal): RedirectResponse
    {
        $validated = $request->validate([
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        $meal->addStock($validated['quantity']);

        $status = $meal->fresh()->getStockStatus();
        return back()->with('success', "Added {$validated['quantity']} units to stock. Current status: {$status}");
    }

    /**
     * Get meals that are low on stock.
     */
    public function lowStockMeals(): Response
    {
        $lowStockMeals = Meal::whereRaw('stock_quantity <= low_stock_threshold')
            ->where('stock_quantity', '>', 0)
            ->orderByRaw('stock_quantity / low_stock_threshold ASC')
            ->get();

        return Inertia::render('meals/low-stock', [
            'lowStockMeals' => $lowStockMeals,
        ]);
    }

    /**
     * Show ingredients for a specific meal.
     */
    public function showIngredients(Meal $meal): Response
    {
        $meal->load('ingredients');
        $allIngredients = Ingredient::orderBy('name')->get();

        return Inertia::render('meals/ingredients', [
            'meal' => $meal,
            'allIngredients' => $allIngredients,
        ]);
    }

    /**
     * Add an ingredient to a meal.
     */
    public function addIngredient(Request $request, Meal $meal): RedirectResponse
    {
        $validated = $request->validate([
            'ingredient_id' => ['required', 'exists:ingredients,id'],
            'quantity_required' => ['required', 'numeric', 'min:0.01'],
        ]);

        // Check if ingredient is already assigned to this meal
        $existing = $meal->ingredients()->where('ingredient_id', $validated['ingredient_id'])->first();

        if ($existing) {
            return back()->with('error', 'This ingredient is already assigned to this meal');
        }

        $meal->ingredients()->attach($validated['ingredient_id'], [
            'quantity_required' => $validated['quantity_required']
        ]);

        return back()->with('success', 'Ingredient added to meal successfully');
    }

    /**
     * Update ingredient quantity for a meal.
     */
    public function updateIngredient(Request $request, Meal $meal, Ingredient $ingredient): RedirectResponse
    {
        $validated = $request->validate([
            'quantity_required' => ['required', 'numeric', 'min:0.01'],
        ]);

        $meal->ingredients()->updateExistingPivot($ingredient->id, [
            'quantity_required' => $validated['quantity_required']
        ]);

        return back()->with('success', 'Ingredient quantity updated successfully');
    }

    /**
     * Remove an ingredient from a meal.
     */
    public function removeIngredient(Meal $meal, Ingredient $ingredient): RedirectResponse
    {
        $meal->ingredients()->detach($ingredient->id);

        return back()->with('success', 'Ingredient removed from meal successfully');
    }
}
