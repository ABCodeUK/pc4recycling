<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('clients_jobs', function (Blueprint $table) {
            $table->string('address')->nullable()->change();
            $table->string('town_city')->nullable()->change();
            $table->string('postcode')->nullable()->change();
            $table->string('onsite_contact')->nullable()->change();
            $table->string('onsite_number')->nullable()->change();
            $table->string('onsite_email')->nullable()->change();
        });
    }

    public function down()
    {
        Schema::table('clients_jobs', function (Blueprint $table) {
            $table->string('address')->nullable(false)->change();
            $table->string('town_city')->nullable(false)->change();
            $table->string('postcode')->nullable(false)->change();
            $table->string('onsite_contact')->nullable(false)->change();
            $table->string('onsite_number')->nullable(false)->change();
            $table->string('onsite_email')->nullable(false)->change();
        });
    }
};