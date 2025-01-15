<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateVariableCustomerTypesTable extends Migration
{
    public function up()
    {
        Schema::create('variable_customer_types', function (Blueprint $table) {
            $table->id();
            $table->string('ct_name'); // Customer Type Name
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('variable_customer_types');
    }
}