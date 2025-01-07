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
        Schema::create('variable_manufacturers', function (Blueprint $table) {
            $table->id(); // Primary key
            $table->string('manufacturer_name'); // Manufacturer name
            $table->string('manufacturer_logo')->nullable(); // Logo (nullable in case it's not provided)
            $table->string('manufacturer_url')->nullable(); // URL (nullable)
            $table->timestamps(); // Created_at and updated_at timestamps
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('variable_manufacturers');
    }
};
