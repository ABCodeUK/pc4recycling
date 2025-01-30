<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'landline')) {
                $table->string('landline')->nullable();
            }
            if (!Schema::hasColumn('users', 'mobile')) {
                $table->string('mobile')->nullable();
            }
            if (!Schema::hasColumn('users', 'type')) {
                $table->string('type')->default('Client');
            }
            if (!Schema::hasColumn('users', 'active')) {
                $table->boolean('active')->default(true);
            }
            if (!Schema::hasColumn('users', 'parent_id')) {
                $table->unsignedBigInteger('parent_id')->nullable();
                $table->foreign('parent_id')->references('id')->on('users')->onDelete('cascade');
            }
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['landline', 'mobile', 'type', 'active']);
            $table->dropForeign(['parent_id']);
            $table->dropColumn('parent_id');
        });
    }
};