<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('company_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_setting_id')->constrained('company_settings')->onDelete('cascade');
            $table->string('document_type');
            $table->string('original_filename');
            $table->string('stored_filename');
            $table->string('file_path');
            $table->string('mime_type');
            $table->integer('file_size');
            $table->uuid('uuid')->unique();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('company_documents');
    }
};