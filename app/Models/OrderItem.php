<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'meal_id',
        'status_id',
        'price',
        'quantity',
    ];

    protected $casts = [
        'price' => 'float',
        'quantity' => 'integer',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function meal(): BelongsTo
    {
        return $this->belongsTo(Meal::class);
    }

    public function status(): BelongsTo
    {
        return $this->belongsTo(Status::class);
    }

    public function getSubtotalAttribute(): float
    {
        return $this->price * $this->quantity;
    }
}
