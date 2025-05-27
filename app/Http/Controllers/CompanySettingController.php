<?php

namespace App\Http\Controllers;

use App\Models\CompanySetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Carbon\Carbon;

class CompanySettingController extends Controller
{
    public function index()
    {
        $settings = CompanySetting::all();
        return Inertia::render('Settings/General/General', [
            'documents' => $settings
        ]);
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'document_name' => 'required|string',
                'document_description' => 'nullable|string',
                'date_from' => 'required|date',
                'date_to' => 'nullable|date', // Make date_to optional
                'document' => 'nullable|file|mimes:pdf|max:10240' // Make document optional
            ]);
    
            $document = new CompanySetting();
            $document->document_name = $request->document_name;
            $document->document_description = $request->document_description;
            $document->date_from = Carbon::parse($request->date_from)->format('Y-m-d');
            $document->date_to = $request->date_to ? Carbon::parse($request->date_to)->format('Y-m-d') : null;

            if ($request->hasFile('document')) {
                $path = $request->file('document')->store('company-documents', 'public');
                $document->document_url = $path;
            }
            
            $document->save();

            return response()->json([
                'success' => true,
                'message' => 'Document added successfully',
                'document' => $document
            ]);
        } catch (\Exception $e) {
            \Log::error('Document save error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to save document: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $document = CompanySetting::findOrFail($id);
            
            $request->validate([
                'document_name' => 'required|string',
                'document_description' => 'nullable|string',
                'date_from' => 'required|date',
                'date_to' => 'nullable|date',
                'document' => 'nullable|file|mimes:pdf|max:10240'
            ]);
    
            if ($request->hasFile('document')) {
                if ($document->document_url) {
                    Storage::disk('public')->delete($document->document_url);
                }
                
                $path = $request->file('document')->store('company-documents', 'public');
                $document->document_url = $path;
            } elseif ($request->has('remove_document') && $request->remove_document === 'true') {
                if ($document->document_url) {
                    Storage::disk('public')->delete($document->document_url);
                }
                $document->document_url = null;
            }
            
            $document->document_name = $request->document_name;
            $document->document_description = $request->document_description;
            $document->date_from = Carbon::parse($request->date_from)->format('Y-m-d');
            $document->date_to = $request->date_to ? Carbon::parse($request->date_to)->format('Y-m-d') : null;
            
            $document->save();
    
            return response()->json([
                'success' => true,
                'message' => 'Document updated successfully',
                'document' => $document
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update document: ' . $e->getMessage()
            ], 500);
        }
    }

    public function downloadDocument($id)
    {
        $document = CompanySetting::findOrFail($id);
        
        if (!$document->document_url) {
            abort(404, 'Document file not found');
        }

        return Storage::disk('public')->download($document->document_url);
    }

    public function deleteDocument($id)
    {
        try {
            $document = CompanySetting::findOrFail($id);
            
            if ($document->document_url) {
                Storage::disk('public')->delete($document->document_url);
            }
            
            $document->delete();
    
            return response()->json([
                'success' => true,
                'message' => 'Document deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete document: ' . $e->getMessage()
            ], 500);
        }
    }

    public function information()
    {
        $documents = CompanySetting::all()->map(function ($document) {
            return [
                'id' => $document->id,
                'key' => strtolower($document->document_name),
                'title' => $document->document_name,
                'description' => $document->document_description, // Update this line
                'url' => $document->document_url ? Storage::url($document->document_url) : null,
                'dates' => [
                    'issue_date' => $document->date_from ? $document->date_from->format('Y-m-d') : null,
                    'expiry_date' => $document->date_to ? $document->date_to->format('Y-m-d') : null,
                ],
            ];
        });
        
        return Inertia::render('ClientArea/Information/Information', [
            'documents' => $documents
        ]);
    }
}