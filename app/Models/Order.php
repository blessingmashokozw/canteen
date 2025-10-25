<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'instructions',
        'payment_method',
        'status',
        'collection_slot_id',
        'order_code',
    ];

    protected $casts = [
        'status' => 'string',
    ];

    protected $appends = ['total', 'available_total'];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($order) {
            if (empty($order->order_code)) {
                $order->order_code = static::generateOrderCode();
            }
        });
    }

    /**
     * Generate a unique 6-character alphanumeric order code
     */
    public static function generateOrderCode(): string
    {
        do {
            $code = Str::upper(Str::random(6));
        } while (static::where('order_code', $code)->exists());

        return $code;
    }

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
