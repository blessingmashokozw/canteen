<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CollectionSlot extends Model
{
    protected $fillable = [
        'date',
        'start_time',
        'end_time',
        'status',
        'capacity',
        'booked_count',
    ];

    protected $casts = [
        'date' => 'date',
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'capacity' => 'integer',
        'booked_count' => 'integer',
    ];

    /**
     * Get the orders associated with this collection slot.
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Check if the slot is available for booking.
     */
    public function isAvailable(): bool
    {
        return $this->status === 'available' && $this->booked_count < $this->capacity;
    }

    /**
     * Check if the slot is full.
     */
    public function isFull(): bool
    {
        return $this->booked_count >= $this->capacity;
    }

    /**
     * Auto-update status when booked_count changes.
     */
    protected static function booted()
    {
        static::saving(function ($slot) {
            if ($slot->booked_count >= $slot->capacity) {
                $slot->status = 'full';
            } elseif ($slot->booked_count > 0) {
                $slot->status = 'booked';
            } else {
                $slot->status = 'available';
            }
        });
    }

    /**
     * Get formatted time range for display.
     */
    public function getTimeRangeAttribute(): string
    {
        return $this->start_time->format('H:i') . ' - ' . $this->end_time->format('H:i');
    }

    /**
     * Get formatted date and time for display.
     */
    public function getDateTimeRangeAttribute(): string
    {
        return $this->date->format('Y-m-d') . ' ' . $this->time_range;
    }

    /**
     * Scope to get only available slots.
     */
    public function scopeAvailable($query)
    {
        return $query->where('status', 'available')
                    ->whereRaw('booked_count < capacity');
    }

    /**
     * Scope to get slots for a specific date.
     */
    public function scopeForDate($query, $date)
    {
        return $query->where('date', $date);
    }

    /**
     * Scope to get slots within a date range.
     */
    public function scopeBetweenDates($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }
}
