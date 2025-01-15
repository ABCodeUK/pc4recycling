<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCategoryHpCodeTable extends Migration
{
    public function up()
    {
        Schema::create('category_hp_codes', function (Blueprint $table) {
            $table->unsignedBigInteger('category_id');
            $table->unsignedBigInteger('hp_code_id');

            $table->foreign('category_id')->references('id')->on('categories')->onDelete('cascade');
            $table->foreign('hp_code_id')->references('id')->on('variable_hp_codes')->onDelete('cascade');

            $table->primary(['category_id', 'hp_code_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('category_hp_codes');
    }
}