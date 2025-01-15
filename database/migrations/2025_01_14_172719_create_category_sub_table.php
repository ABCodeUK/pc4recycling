<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCategorySubTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('category_sub', function (Blueprint $table) {
            $table->id(); // Primary key
            $table->string('name'); // Subcategory name
            $table->decimal('default_weight', 10, 2)->default(0); // Default weight with precision
            $table->unsignedBigInteger('parent_id'); // Foreign key for the parent category
            $table->timestamps();

            // Add the foreign key constraint to the parent category table
            $table->foreign('parent_id')
                  ->references('id')
                  ->on('categories')
                  ->onDelete('cascade'); // Cascade delete when parent is deleted
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('category_sub');
    }
}