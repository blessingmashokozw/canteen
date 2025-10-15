<?php

namespace App\Http\Controllers;

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
}
