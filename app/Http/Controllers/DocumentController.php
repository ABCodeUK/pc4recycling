<?php

namespace App\Http\Controllers;

use App\Models\Job;
use App\Models\JobDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class JobDocumentController extends Controller
{
    public function store(Request $request, $id)
    {
        $job = Job::findOrFail($id);
        
        $request->validate([
            'document' => 'required|file|mimes:pdf|max:10240',
            'document_type' => 'required|string'
        ]);
    
        $file = $request->file('document');
        $documentType = $request->input('document_type');
        
        // Create job folder if it doesn't exist
        $jobFolder = "jobs/{$job->job_id}";
        if (!Storage::exists($jobFolder)) {
            Storage::makeDirectory($jobFolder);
        }
    
        // Generate filename based on document type
        $extension = $file->getClientOriginalExtension();
        $filename = match ($documentType) {
            'collection_manifest' => "{$job->job_id}-Collection-Manifest.{$extension}",
            'hazard_waste_note' => "{$job->job_id}-Hazard-Waste-Note.{$extension}",
            'data_destruction_certificate' => "{$job->job_id}-Data-Destruction-Certificate.{$extension}",
            'other' => "{$job->job_id}-{$file->getClientOriginalName()}",
        };
    
        // Store the file in the job folder
        $path = $file->storeAs($jobFolder, $filename, 'public');
    
        $document = JobDocument::create([
            'job_id' => $job->id,
            'document_type' => $documentType,
            'original_filename' => $filename, // Change this to store the new filename
            'stored_filename' => $filename,
            'file_path' => $path,
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
        ]);
    
        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Document uploaded successfully',
                'document' => $document
            ]);
        }
    
        return back()->with([
            'success' => true,
            'message' => 'Document uploaded successfully',
            'document' => $document
        ]);
    }

    public function destroy(Request $request, $jobId, $documentId)
    {
        $document = JobDocument::findOrFail($documentId);
        
        if ($document->job_id != $jobId) {
            if ($request->wantsJson()) {
                return response()->json(['error' => 'Document does not belong to this job'], 403);
            }
            return back()->with('error', 'Document does not belong to this job');
        }
    
        // Delete the physical file from storage
        if (Storage::disk('public')->exists($document->file_path)) {
            Storage::disk('public')->delete($document->file_path);
        }
        
        $documentType = $document->document_type;
        
        // Delete the database record
        $document->delete();
    
        if ($request->wantsJson()) {
            return back()->with([
                'success' => true,
                'message' => 'Document deleted successfully',
                'document_type' => $documentType
            ]);
        }
    
        return back()->with('success', 'Document deleted successfully');
    }
}