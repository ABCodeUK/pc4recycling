<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('company_settings', function (Blueprint $table) {
            $table->id();
            
            // Insurance Cover
            $table->date('insurance_cover_issue_date')->nullable();
            $table->string('insurance_cover_expiry_date')->nullable();
            $table->string('insurance_cover_url')->nullable();

            // Environment Agency
            $table->date('environment_agency_issue_date')->nullable();
            $table->string('environment_agency_expiry_date')->nullable();
            $table->string('environment_agency_url')->nullable();

            // Waste Carrier
            $table->date('waste_carrier_issue_date')->nullable();
            $table->string('waste_carrier_expiry_date')->nullable();
            $table->string('waste_carrier_url')->nullable();

            // ISO 27001
            $table->date('iso_27001_issue_date')->nullable();
            $table->string('iso_27001_expiry_date')->nullable();
            $table->string('iso_27001_url')->nullable();

            // ISO 9001
            $table->date('iso_9001_issue_date')->nullable();
            $table->string('iso_9001_expiry_date')->nullable();
            $table->string('iso_9001_url')->nullable();

            // ISO 14001
            $table->date('iso_14001_issue_date')->nullable();
            $table->string('iso_14001_expiry_date')->nullable();
            $table->string('iso_14001_url')->nullable();

            // Company Incorporation
            $table->date('company_incorporation_issue_date')->nullable();
            $table->string('company_incorporation_expiry_date')->nullable();
            $table->string('company_incorporation_url')->nullable();

            // VAT Registration
            $table->date('vat_registration_issue_date')->nullable();
            $table->string('vat_registration_expiry_date')->nullable();
            $table->string('vat_registration_url')->nullable();

            // Health & Safety Policy
            $table->date('health_safety_policy_issue_date')->nullable();
            $table->string('health_safety_policy_expiry_date')->nullable();
            $table->string('health_safety_policy_url')->nullable();

            // Data Destruction Policy
            $table->date('data_destruction_policy_issue_date')->nullable();
            $table->string('data_destruction_policy_expiry_date')->nullable();
            $table->string('data_destruction_policy_url')->nullable();

            // Environmental Policy
            $table->date('environmental_policy_issue_date')->nullable();
            $table->string('environmental_policy_expiry_date')->nullable();
            $table->string('environmental_policy_url')->nullable();

            // GDPR Compliance
            $table->date('gdpr_compliance_issue_date')->nullable();
            $table->string('gdpr_compliance_expiry_date')->nullable();
            $table->string('gdpr_compliance_url')->nullable();

            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('company_settings');
    }
};