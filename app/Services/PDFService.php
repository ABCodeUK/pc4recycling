<?php

namespace App\Services;

use App\Models\Job;
use Barryvdh\DomPDF\Facade\Pdf;

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
            'driver_signature_name' => $job->driver_signature_name,
            'collected_at' => $job->collected_at
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
}