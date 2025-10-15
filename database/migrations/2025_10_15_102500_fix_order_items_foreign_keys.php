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
        Schema::table('order_items', function (Blueprint $table) {
            // Drop existing columns without constraints
            $table->dropForeign(['order_id']);
            $table->dropForeign(['meal_id']);
            $table->dropForeign(['status_id']);

            // Recreate with proper foreign key constraints
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('meal_id')->constrained()->onDelete('cascade');
            $table->foreignId('status_id')->constrained()->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            // Drop foreign key constraints
            $table->dropForeign(['order_id']);
            $table->dropForeign(['meal_id']);
            $table->dropForeign(['status_id']);

            // Recreate as simple integers
            $table->integer('order_id');
            $table->integer('meal_id');
            $table->integer('status_id');
        });
    }
};
