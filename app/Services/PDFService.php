<?php

namespace App\Services;

use App\Models\Job;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use App\Models\JobDocument;

class PDFService
{
    public function generateCollectionManifest(Job $job)
    {
        // Load job with relationships
        $job->load(['client', 'items.category']);

        // Generate PDF
        $pdf = Pdf::loadView('pdfs.collection-manifest', [
            'job' => $job,
            'customer' => $job->client,
            'items' => $job->items,
            'customer_signature_name' => $job->customer_signature_name,
            'driver_signature_name' => $job->driver_signature_name
        ]);

        return $pdf;
    }

    // Add new method for hazardous waste note
    public function generateHazardousWasteNote(Job $job, bool $includeStaffSignature = false)
    {
        // Load job with relationships including subcategories
        $job->load([
            'client', 
            'items.category',
            'items.subCategory'
        ]);

        // Generate PDF
        $pdf = Pdf::loadView('pdfs.hazardous-waste-note', [
            'job' => $job,
            'customer' => $job->client,
            'items' => $job->items,
            'includeStaffSignature' => $includeStaffSignature,
            'collectionDate' => $job->collected_at // Pass the collection timestamp
        ]);

        return $pdf;
    }

    public function generateReceivedManifest(Job $job)
    {
        // Load job with relationships
        $job->load(['client', 'items.category']);

        // Generate PDF with all signatures
        $pdf = Pdf::loadView('pdfs.collection-manifest', [
            'job' => $job,
            'customer' => $job->client,
            'items' => $job->items,
            'customer_signature_name' => $job->customer_signature_name,
            'driver_signature_name' => $job->driver_signature_name,
            'includeStaffSignature' => true
        ]);

        $filename = "{$job->job_id}-Collection-Manifest.pdf";
        $path = "jobs/{$job->job_id}/{$filename}";

        // Save to storage, replacing existing file if it exists
        Storage::disk('public')->put($path, $pdf->output());

        // Update or create document record
        if ($existingManifest = $job->documents()->where('document_type', 'collection_manifest')->first()) {
            $existingManifest->touch();
        } else {
            JobDocument::create([
                'job_id' => $job->id,
                'document_type' => 'collection_manifest',
                'original_filename' => $filename,
                'stored_filename' => $filename,
                'file_path' => $path,
                'mime_type' => 'application/pdf',
                'file_size' => Storage::disk('public')->size($path)
            ]);
        }

        return $path;
    }

    public function generateDataDestructionCertificate(Job $job)
    {
        // Load job with relationships
        $job->load(['client', 'items']);
    
        // Generate PDF
        $pdf = Pdf::loadView('pdfs.data-destruction-certificate', [
            'job' => $job,
            'customer' => $job->client,
            'items' => $job->items
        ]);
    
        $filename = "{$job->job_id}-Data-Destruction-Certificate.pdf";
        $path = "jobs/{$job->job_id}/{$filename}";
    
        // Save to storage, replacing existing file if it exists
        Storage::disk('public')->put($path, $pdf->output());
    
        // Create a new document record
        $document = JobDocument::create([
            'job_id' => $job->id,
            'document_type' => 'data_destruction_certificate',
            'original_filename' => $filename,
            'stored_filename' => $filename,
            'file_path' => $path,
            'mime_type' => 'application/pdf',
            'file_size' => Storage::disk('public')->size($path),
            'uuid' => \Str::uuid() // Add a UUID for secure access
        ]);
    
        return [
            'path' => $path,
            'document' => $document
        ];
    }
}