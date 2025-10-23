<?php

namespace Database\Seeders;

use App\Models\Ingredient;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class IngredientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $ingredients = [
            [
                'name' => 'Chicken Breast',
                'unit' => 'pieces',
                'stock_quantity' => 50,
                'low_stock_threshold' => 10,
            ],
            [
                'name' => 'Rice',
                'unit' => 'kg',
                'stock_quantity' => 25,
                'low_stock_threshold' => 5,
            ],
            [
                'name' => 'Tomato Sauce',
                'unit' => 'liters',
                'stock_quantity' => 15,
                'low_stock_threshold' => 3,
            ],
            [
                'name' => 'Cheese',
                'unit' => 'kg',
                'stock_quantity' => 8,
                'low_stock_threshold' => 2,
            ],
            [
                'name' => 'Lettuce',
                'unit' => 'heads',
                'stock_quantity' => 20,
                'low_stock_threshold' => 5,
            ],
            [
                'name' => 'Bread',
                'unit' => 'loaves',
                'stock_quantity' => 12,
                'low_stock_threshold' => 3,
            ],
            [
                'name' => 'Beef Patty',
                'unit' => 'pieces',
                'stock_quantity' => 30,
                'low_stock_threshold' => 8,
            ],
            [
                'name' => 'Potatoes',
                'unit' => 'kg',
                'stock_quantity' => 40,
                'low_stock_threshold' => 10,
            ],
        ];

        foreach ($ingredients as $ingredient) {
            Ingredient::firstOrCreate(
                ['name' => $ingredient['name']],
                $ingredient
            );
        }
    }
}
