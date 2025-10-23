<?php

namespace Database\Seeders;

use App\Models\Ingredient;
use App\Models\Meal;
use Illuminate\Database\Seeder;

class MealsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $meals = [
            [
                'name' => 'Sadza and Beef',
                'price' => 1,
                'ingredients' => [
                    ['name' => 'Beef Patty', 'quantity' => 1],
                    ['name' => 'Rice', 'quantity' => 0.2], // 200g of rice
                ]
            ],
            [
                'name' => 'Sadza and Chicken',
                'price' => 1,
                'ingredients' => [
                    ['name' => 'Chicken Breast', 'quantity' => 1],
                    ['name' => 'Rice', 'quantity' => 0.2],
                ]
            ],
            [
                'name' => 'Sadza and Matemba',
                'price' => 0.80,
                'ingredients' => [
                    ['name' => 'Rice', 'quantity' => 0.2],
                ]
            ],
            [
                'name' => 'Rice and Chicken',
                'price' => 1,
                'ingredients' => [
                    ['name' => 'Chicken Breast', 'quantity' => 1],
                    ['name' => 'Rice', 'quantity' => 0.3],
                ]
            ],
            [
                'name' => 'Sadza and Vegetables',
                'price' => 0.50,
                'ingredients' => [
                    ['name' => 'Lettuce', 'quantity' => 0.5], // Half a head
                    ['name' => 'Tomato Sauce', 'quantity' => 0.1], // 100ml
                ]
            ],
            [
                'name' => 'Chips and Chicken',
                'price' => 2.00,
                'ingredients' => [
                    ['name' => 'Chicken Breast', 'quantity' => 1],
                    ['name' => 'Potatoes', 'quantity' => 0.3], // 300g potatoes for chips
                ]
            ],
            [
                'name' => 'Rice and Beef',
                'price' => 1.00,
                'ingredients' => [
                    ['name' => 'Beef Patty', 'quantity' => 1],
                    ['name' => 'Rice', 'quantity' => 0.3],
                ]
            ],
            [
                'name' => 'Sadza and Madora',
                'price' => 1.50,
                'ingredients' => [
                    ['name' => 'Rice', 'quantity' => 0.2],
                    ['name' => 'Cheese', 'quantity' => 0.1], // 100g cheese
                ]
            ],
        ];

        foreach ($meals as $mealData) {
            $meal = Meal::firstOrCreate(
                [
                    'name' => $mealData['name'],
                    'price' => $mealData['price'],
                ],
                [
                    'stock_quantity' => 20,
                    'low_stock_threshold' => 5,
                ]
            );

            // Attach ingredients to the meal
            foreach ($mealData['ingredients'] as $ingredientData) {
                $ingredient = Ingredient::where('name', $ingredientData['name'])->first();

                if ($ingredient) {
                    // Check if already attached to avoid duplicates
                    $existing = $meal->ingredients()->where('ingredient_id', $ingredient->id)->first();
                    if (!$existing) {
                        $meal->ingredients()->attach($ingredient->id, [
                            'quantity_required' => $ingredientData['quantity']
                        ]);
                    }
                }
            }
        }
    }
}
