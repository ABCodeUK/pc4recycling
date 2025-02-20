<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('clients_jobs', function (Blueprint $table) {
            // First drop the column if it exists
            $table->dropColumn('data_sanitisation');
        });

        Schema::table('clients_jobs', function (Blueprint $table) {
            // Recreate the column as unsigned bigint
            $table->unsignedBigInteger('data_sanitisation')->nullable();
            
            // Add the foreign key constraint
            $table->foreign('data_sanitisation')
                  ->references('id')
                  ->on('variable_data_sanitisation')
                  ->nullOnDelete();
        });
    }

    public function down()
    {
        Schema::table('clients_jobs', function (Blueprint $table) {
            // Remove the foreign key constraint
            $table->dropForeign(['data_sanitisation']);
            
            // Change back to original type
            $table->dropColumn('data_sanitisation');
            $table->string('data_sanitisation')->nullable();
        });
    }
};