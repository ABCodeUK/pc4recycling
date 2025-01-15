<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('users_roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // Role name must be unique
            $table->timestamps();
        });
    
        Schema::table('users_staff', function (Blueprint $table) {
            $table->unsignedBigInteger('role_id')->nullable()->after('user_id');
    
            // Set up the foreign key relationship
            $table->foreign('role_id')->references('id')->on('users_roles')->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users_roles');
    }
};
