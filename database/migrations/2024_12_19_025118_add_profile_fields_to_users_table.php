<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('position')->nullable()->after('email'); // Add 'position' field
            $table->string('landline')->nullable()->after('position'); // Add 'landline' field
            $table->string('mobile')->nullable()->after('landline'); // Add 'mobile' field
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['position', 'landline', 'mobile']); // Remove the added fields
        });
    }
};
