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
    ];

    protected $appends = ['total'];

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
}
