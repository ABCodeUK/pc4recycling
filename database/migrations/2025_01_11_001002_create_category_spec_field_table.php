<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCategorySpecFieldTable extends Migration
{
    public function up()
    {
        Schema::create('category_spec_field', function (Blueprint $table) {
            $table->unsignedBigInteger('category_id');
            $table->unsignedBigInteger('spec_field_id');

            $table->foreign('category_id')->references('id')->on('categories')->onDelete('cascade');
            $table->foreign('spec_field_id')->references('id')->on('variable_spec_fields')->onDelete('cascade');

            $table->primary(['category_id', 'spec_field_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('category_spec_field');
    }
}