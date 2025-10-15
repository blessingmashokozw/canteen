<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MealsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $meals = [
            ['name' => 'Sadza and Beef', 'price' => 1],
            ['name' => 'Sadza and Chicken', 'price' => 1],
            ['name' => 'Sadza and Matemba', 'price' => 0.80],
            ['name' => 'Rice and Chicken', 'price' => 1],
            ['name' => 'Sadza and Vegetables', 'price' => 0.50],
            ['name' => 'Chips and Chicken', 'price' => 2.00],
            ['name' => 'Rice and Beef', 'price' => 1.00],
            ['name' => 'Sadza and Madora', 'price' => 1.50],
        ];

        foreach ($meals as $meal) {
            DB::table('meals')->insert([
                'name' => $meal['name'],
                'price' => $meal['price'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
