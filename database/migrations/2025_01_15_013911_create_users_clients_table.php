<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('users_clients', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('customer_type')->nullable();
            $table->text('address')->nullable();
            $table->string('town_city')->nullable();
            $table->string('county')->nullable();
            $table->string('postcode', 50)->nullable();
            $table->string('contact_name')->nullable();
            $table->string('contact_position')->nullable();
            $table->unsignedBigInteger('lead_source_id')->nullable();
            $table->unsignedBigInteger('industry_id')->nullable();
            $table->string('sic_code', 50)->nullable();
            $table->text('customer_notes')->nullable();
    
            // Foreign Key Relationships
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('lead_source_id')->references('id')->on('users_lead_sources')->onDelete('set null');
            $table->foreign('industry_id')->references('id')->on('users_industries')->onDelete('set null');
    
            $table->timestamps();
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('users_clients');
    }
};
