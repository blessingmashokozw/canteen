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
        Schema::create('collection_slots', function (Blueprint $table) {
            $table->id();
            $table->date('date'); // Date for the collection slot
            $table->time('start_time'); // Start time of the slot
            $table->time('end_time'); // End time of the slot
            $table->enum('status', ['available', 'booked', 'full'])->default('available'); // Status of the slot
            $table->integer('capacity')->default(10); // Maximum number of orders that can use this slot
            $table->integer('booked_count')->default(0); // Number of orders currently booked for this slot
            $table->timestamps();

            // Index for efficient queries
            $table->index(['date', 'start_time']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('collection_slots');
    }
};
