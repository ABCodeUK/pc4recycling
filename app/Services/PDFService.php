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
            'items' => $job->items
        ]);

        return $pdf;
    }
}