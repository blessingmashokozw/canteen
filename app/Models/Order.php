<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'instructions',
        'payment_method',
        'status',
    ];

    protected $casts = [
        'status' => 'string',
    ];

    protected $appends = ['total', 'available_total'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function getTotalAttribute(): float
    {
        return $this->orderItems->sum(function ($item) {
            return $item->price * $item->quantity;
        });
    }

    public function getAvailableTotalAttribute(): float
    {
        return $this->orderItems->where('is_available', true)->sum(function ($item) {
            return $item->price * $item->quantity;
        });
    }
}
