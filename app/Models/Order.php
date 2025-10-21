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
        'collection_slot_id',
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

    public function collectionSlot(): BelongsTo
    {
        return $this->belongsTo(CollectionSlot::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
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

    /**
     * Get formatted collection slot time for display.
     */
    public function getCollectionSlotTimeAttribute(): ?string
    {
        return $this->collectionSlot ? $this->collectionSlot->time_range : null;
    }

    /**
     * Get formatted collection slot date and time for display.
     */
    public function getCollectionSlotDateTimeAttribute(): ?string
    {
        return $this->collectionSlot ? $this->collectionSlot->date_time_range : null;
    }
}
