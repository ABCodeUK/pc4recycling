<?php

namespace App\Http\Controllers\ClientArea;

use App\Http\Controllers\Controller;
use App\Models\CompanySetting;
use App\Models\CompanyDocument;
use Inertia\Inertia;

class InformationController extends Controller
{
    public function index()
    {
        $documents = CompanySetting::all();
        
        return Inertia::render('ClientArea/Information/Information', [
            'documents' => $documents->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'key' => str_slug($doc->document_name),
                    'title' => $doc->document_name,
                    'description' => $doc->document_name,
                    'url' => $doc->document_url,
                    'dates' => [
                        'issue_date' => $doc->date_from?->format('Y-m-d'),
                        'expiry_date' => $doc->date_to?->format('Y-m-d')
                    ]
                ];
            })
        ]);
    }
}