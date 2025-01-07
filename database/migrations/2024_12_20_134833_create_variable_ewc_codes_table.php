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
        Schema::create('variable_ewc_codes', function (Blueprint $table) {
            $table->id();
            $table->string('ewc_code')->unique(); // EWC Code
            $table->string('ea_description');    // EA Description
            $table->timestamps();                // created_at and updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('variable_ewc_codes');
    }
};
