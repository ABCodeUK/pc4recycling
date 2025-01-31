<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('job_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_id')->constrained('clients_jobs')->onDelete('cascade');
            $table->string('document_type'); // 'collection_manifest', 'hazard_waste_note', 'data_destruction_certificate', 'other'
            $table->string('original_filename');
            $table->string('stored_filename');
            $table->string('file_path');
            $table->string('mime_type');
            $table->integer('file_size');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('job_documents');
    }
};