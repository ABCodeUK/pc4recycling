<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
public function up()
{
    Schema::create('variable_hp_codes', function (Blueprint $table) {
        $table->id();
        $table->string('hp_code')->unique();
        $table->string('hp_type');
        $table->text('hp_description');
        $table->timestamps();
    });
}

public function down()
{
    Schema::dropIfExists('variable_hp_codes');
}

};
