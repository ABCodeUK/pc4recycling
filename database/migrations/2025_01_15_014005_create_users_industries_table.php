<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('users_industries', function (Blueprint $table) {
            $table->id(); // Automatically creates an unsignedBigInteger
            $table->string('in_name');
            $table->timestamps();
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('users_industries');
    }
};
