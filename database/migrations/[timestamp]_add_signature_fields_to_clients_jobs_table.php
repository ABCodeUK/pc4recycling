<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('clients_jobs', function (Blueprint $table) {
            $table->string('customer_signature_url')->nullable();
            $table->string('customer_signature_name')->nullable();
            $table->string('driver_signature_url')->nullable();
            $table->string('driver_signature_name')->nullable();
            $table->string('staff_signature_url')->nullable();
            $table->string('staff_signature_name')->nullable();
        });
    }

    public function down()
    {
        Schema::table('clients_jobs', function (Blueprint $table) {
            $table->dropColumn([
                'customer_signature_url',
                'customer_signature_name',
                'driver_signature_url',
                'driver_signature_name',
                'staff_signature_url',
                'staff_signature_name'
            ]);
        });
    }
};