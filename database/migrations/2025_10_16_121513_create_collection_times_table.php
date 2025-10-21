<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('collection_times', function (Blueprint $table) {
            $table->id();
            $table->date('date'); // Date for this collection time slot
            $table->time('start_time'); // Start time (e.g., 12:00:00)
            $table->time('end_time'); // End time (e.g., 12:15:00)
            $table->integer('max_orders')->default(10); // Maximum orders allowed in this slot
            $table->integer('current_orders')->default(0); // Current number of orders booked
            $table->boolean('is_active')->default(true); // Whether this slot is available for booking
            $table->timestamps();

            // Index for efficient queries
            $table->index(['date', 'start_time']);
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('collection_times');
    }
};
