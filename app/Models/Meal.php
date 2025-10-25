<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Meal extends Model
{
    protected $fillable = [
        'name',
        'price',
        'image',
        'stock_quantity',
        'low_stock_threshold',
    ];

    protected $casts = [
        'price' => 'float',
        'stock_quantity' => 'integer',
        'low_stock_threshold' => 'integer',
    ];

    /**
     * Get ingredients for this meal.
     */
    public function ingredients()
    {
        return $this->belongsToMany(Ingredient::class, 'meal_ingredients')
                    ->withPivot('quantity_required')
                    ->withTimestamps();
    }

    /**
     * Check if meal is in stock (considering both meal stock and ingredient availability).
     */
    public function isInStock(): bool
    {
        // First check if meal has stock
        if ($this->stock_quantity <= 0) {
            return false;
        }

        // Then check if all required ingredients are available
        foreach ($this->ingredients as $ingredient) {
            $requiredQuantity = $ingredient->pivot->quantity_required;
            if ($ingredient->stock_quantity < $requiredQuantity) {
                return false;
            }
        }

        return true;
    }

    /**
     * Check if meal is low on stock.
     */
    public function isLowStock(): bool
    {
        return $this->stock_quantity > 0 && $this->stock_quantity <= $this->low_stock_threshold;
    }

    /**
     * Check if meal is out of stock.
     */
    public function isOutOfStock(): bool
    {
        return $this->stock_quantity <= 0;
    }

    /**
     * Reduce stock quantity when an order is placed.
     * Also reduces ingredient stock.
     */
    public function reduceStock(int $quantity): bool
    {
        
        if ($this->stock_quantity >= $quantity) {
            // Reduce meal stock
            $this->decrement('stock_quantity', $quantity);
            
            // Reduce ingredient stock for each ingredient used
            // foreach ($this->ingredients as $ingredient) {
               
            //     $requiredQuantity = $ingredient->pivot->quantity_required * $quantity;
            //     $ingredient->reduceStock($requiredQuantity);
            // }

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
     * Get ingredients that are low on stock for this meal.
     */
    public function getLowStockIngredients()
    {
        return $this->ingredients()->wherePivot('quantity_required', '>', 0)
                    ->whereRaw('stock_quantity <= low_stock_threshold')
                    ->get();
    }
}