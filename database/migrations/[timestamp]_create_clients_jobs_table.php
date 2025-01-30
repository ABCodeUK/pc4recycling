<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('clients_jobs', function (Blueprint $table) {
            $table->id();
            $table->string('job_id')->unique();
            $table->foreignId('client_id')->constrained('users')->onDelete('cascade');
            $table->date('collection_date')->nullable();
            $table->enum('job_status', [
                'Needs Scheduling',
                'Request Pending',
                'Scheduled',
                'Postponed',
                'Collected',
                'Processing',
                'Complete',
                'Canceled'
            ]);
            $table->string('staff_collecting')->nullable();
            $table->string('vehicle')->nullable();
            $table->string('address');
            $table->string('town_city');
            $table->string('postcode');
            $table->string('onsite_contact')->nullable();
            $table->string('onsite_number')->nullable();
            $table->string('onsite_email')->nullable();
            $table->enum('collection_type', [
                'IT Asset Disposal (ITAD)',
                'IT Asset Remarketing (Resale)',
                'IT Asset Redeployment'
            ]);
            $table->enum('data_sanitisation', [
                'Data Erasue Higher',
                'Data Erasure Lower',
                'No Sanitisation Required',
                'Off-site Hard Drive Punching',
                'Off-site Hard Drive Shredding',
                'on-site Hard Drive Punching',
                'on-site Hard Drive Shredding'
            ]);
            $table->string('sla')->nullable();
            $table->text('instructions')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('clients_jobs');
    }
};