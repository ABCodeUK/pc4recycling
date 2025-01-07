<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateVariableSpecFieldsTable extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('variable_spec_fields', function (Blueprint $table) {
            $table->id();
            $table->string('spec_name')->unique(); // Ensures each spec name is unique
            $table->integer('spec_order'); // Defines the order
            $table->boolean('spec_default')->default(false); // Whether it's a default spec field
            $table->timestamps(); // Created at and updated at timestamps
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('variable_spec_fields');
    }
}

