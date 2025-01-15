<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCategoriesTable extends Migration
{
    public function up()
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->decimal('default_weight', 8, 2)->nullable();
            $table->unsignedBigInteger('ewc_code_id'); // Foreign key to EWC codes table
            $table->enum('physical_form', ['Solid', 'Liquid', 'Mixed', 'Sludge']);
            $table->string('concentration')->nullable();
            $table->string('chemical_component')->nullable();
            $table->string('container_type')->nullable();
            $table->timestamps();

            // Foreign key constraint
            $table->foreign('ewc_code_id')->references('id')->on('variable_ewc_codes')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('categories');
    }
}