<?php

namespace App\Http\Controllers;

use App\Models\CollectionSlot;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CollectionSlotController extends Controller
{
    /**
     * Display collection slots management page.
     */
    public function index(Request $request)
    {
        $query = CollectionSlot::query();

        // Filter by date if provided
        if ($request->filled('date')) {
            $query->where('date', $request->date);
        }

        // Filter by status if provided
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $slots = $query->orderBy('date')->orderBy('start_time')->paginate(20)->withQueryString();

        // Get summary stats
        $stats = [
            'total_slots' => CollectionSlot::count(),
            'available_slots' => CollectionSlot::where('status', 'available')->count(),
            'booked_slots' => CollectionSlot::where('status', 'booked')->count(),
            'full_slots' => CollectionSlot::where('status', 'full')->count(),
        ];

        return Inertia::render('collection-slots/index', [
            'slots' => $slots,
            'stats' => $stats,
            'filters' => $request->only(['date', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new collection slot.
     */
    public function create()
    {
        return Inertia::render('collection-slots/create');
    }

    /**
     * Store a newly created collection slot.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => ['required', 'date', 'after_or_equal:today'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'capacity' => ['required', 'integer', 'min:1', 'max:100'],
        ]);

        // Check if slot already exists for this date and time
        $existingSlot = CollectionSlot::where('date', $validated['date'])
            ->where('start_time', $validated['start_time'])
            ->where('end_time', $validated['end_time'])
            ->first();

        if ($existingSlot) {
            return back()->withErrors(['slot' => 'A slot with this date and time already exists']);
        }

        CollectionSlot::create([
            'date' => $validated['date'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'capacity' => $validated['capacity'],
            'status' => 'available',
            'booked_count' => 0,
        ]);

        return redirect()->route('collection-slots.index')
            ->with('success', 'Collection slot created successfully');
    }

    /**
     * Show the form for editing a collection slot.
     */
    public function edit(CollectionSlot $slot)
    {
        return Inertia::render('collection-slots/edit', [
            'slot' => $slot,
        ]);
    }

    /**
     * Update the specified collection slot.
     */
    public function update(Request $request, CollectionSlot $slot)
    {
        $validated = $request->validate([
            'date' => ['required', 'date', 'after_or_equal:today'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'capacity' => ['required', 'integer', 'min:1', 'max:100'],
            'status' => ['required', 'in:available,booked,full'],
        ]);

        // Check if slot already exists for this date and time (excluding current slot)
        $existingSlot = CollectionSlot::where('date', $validated['date'])
            ->where('start_time', $validated['start_time'])
            ->where('end_time', $validated['end_time'])
            ->where('id', '!=', $slot->id)
            ->first();

        if ($existingSlot) {
            return back()->withErrors(['slot' => 'A slot with this date and time already exists']);
        }

        $slot->update($validated);

        return redirect()->route('collection-slots.index')
            ->with('success', 'Collection slot updated successfully');
    }

    /**
     * Remove the specified collection slot.
     */
    public function destroy(CollectionSlot $slot)
    {
        // Check if slot has any orders assigned
        if ($slot->orders()->exists()) {
            return back()->withErrors(['slot' => 'Cannot delete slot that has orders assigned to it']);
        }

        $slot->delete();

        return redirect()->route('collection-slots.index')
            ->with('success', 'Collection slot deleted successfully');
    }

    /**
     * Get available collection slots for today (API endpoint).
     */
    public function getAvailableSlots(Request $request)
    {
        $today = now()->toDateString();

        $slots = CollectionSlot::available()
            ->forDate($today)
            ->orderBy('start_time')
            ->get(['id', 'start_time', 'end_time', 'date', 'capacity', 'booked_count']);

        // Format the slots for frontend
        $formattedSlots = $slots->map(function ($slot) {
            return [
                'id' => $slot->id,
                'time_range' => $slot->start_time->format('H:i') . ' - ' . $slot->end_time->format('H:i'),
                'date_time_range' => $slot->date->format('Y-m-d') . ' ' . $slot->time_range,
                'available_capacity' => $slot->capacity - $slot->booked_count,
            ];
        });

        return response()->json($formattedSlots);
    }
}
