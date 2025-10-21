<?php

namespace Database\Seeders;

use App\Models\CollectionSlot;
use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CollectionSlotSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define the start and end times for collection slots
        $startTime = Carbon::createFromTime(12, 25, 0); // 12:25
        $endTime = Carbon::createFromTime(14, 0, 0);    // 14:00

        // Generate slots for the next 30 days (you can adjust this)
        for ($day = 0; $day < 30; $day++) {
            $currentDate = Carbon::today()->addDays($day);
            $currentTime = $startTime->copy();

            while ($currentTime->lessThan($endTime)) {
                $slotStart = $currentTime;
                $slotEnd = $currentTime->copy()->addMinutes(15);

                // Don't create slots beyond 14:00
                if ($slotEnd->greaterThan($endTime)) {
                    break;
                }

                CollectionSlot::create([
                    'date' => $currentDate->toDateString(),
                    'start_time' => $slotStart->toTimeString(),
                    'end_time' => $slotEnd->toTimeString(),
                    'status' => 'available',
                    'capacity' => 10, // 10 orders per slot by default
                    'booked_count' => 0,
                ]);

                $currentTime->addMinutes(15);
            }
        }

        $this->command->info('Collection slots created successfully from 12:25 to 14:00 for the next 30 days');
    }
}
