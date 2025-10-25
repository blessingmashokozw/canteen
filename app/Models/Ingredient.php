<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ingredient extends Model
{
    protected $fillable = [
        'name',
        'unit',
        'stock_quantity',
        'low_stock_threshold',
    ];

    protected $casts = [
        'stock_quantity' => 'decimal:3',
        'low_stock_threshold' => 'decimal:3',
    ];

    /**
     * Check if ingredient is in stock.
     */
    public function isInStock(): bool
    {
        return $this->stock_quantity > 0;
    }

    /**
     * Check if ingredient is low on stock.
     */
    public function isLowStock(): bool
    {
        return $this->stock_quantity > 0 && $this->stock_quantity <= $this->low_stock_threshold;
    }

    /**
     * Check if ingredient is out of stock.
     */
    public function isOutOfStock(): bool
    {
        return $this->stock_quantity <= 0;
    }

    /**
     * Reduce stock quantity when used in a meal.
     */
    public function reduceStock(float $quantity): bool
    {
        // dd(["action"=> "reduceStock", "quantity"=>$quantity,"stock_quantity"=>$this->stock_quantity]);
        if ($this->stock_quantity >= $quantity) {
           // dd($quantity);
            $this->decrement('stock_quantity', $quantity);
            return true;
        }
        return false;
    }

    /**
     * Increase stock quantity (for restocking).
     */
    public function addStock(int $quantity): void
    {
        $this->increment('stock_quantity', $quantity);
    }

    /**
     * Get stock status for display.
     */
    public function getStockStatus(): string
    {
        if ($this->isOutOfStock()) {
            return 'Out of Stock';
        } elseif ($this->isLowStock()) {
            return 'Low Stock';
        } else {
            return 'In Stock';
        }
    }

    /**
     * Get stock badge variant for UI.
     */
    public function getStockBadgeVariant(): string
    {
        if ($this->isOutOfStock()) {
            return 'destructive';
        } elseif ($this->isLowStock()) {
            return 'default';
        } else {
            return 'secondary';
        }
    }

    /**
     * Get meals that use this ingredient.
     */
    public function meals()
    {
        return $this->belongsToMany(Meal::class, 'meal_ingredients')
                    ->using(MealIngredient::class)
                    ->withPivot('quantity_required')
                    ->withTimestamps();
    }
}