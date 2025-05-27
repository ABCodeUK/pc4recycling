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
        $settings = CompanySetting::first();
        
        // Debug what we're getting from the database
        \Log::info('Settings:', [
            'data' => $settings?->toArray() ?? 'No settings found'
        ]);
    
        $documentDates = [
            'insurance_cover' => [
                'issue_date' => $settings?->insurance_cover_issue_date?->format('Y-m-d'),
                'expiry_date' => $settings?->insurance_cover_expiry_date?->format('Y-m-d'),
            ],
            'environment_agency' => [
                'issue_date' => optional($settings->environment_agency_issue_date)->format('Y-m-d'),
                'expiry_date' => optional($settings->environment_agency_expiry_date)->format('Y-m-d'),
            ],
            'waste_carrier' => [
                'issue_date' => optional($settings->waste_carrier_issue_date)->format('Y-m-d'),
                'expiry_date' => optional($settings->waste_carrier_expiry_date)->format('Y-m-d'),
            ],
            'iso_27001' => [
                'issue_date' => optional($settings->iso_27001_issue_date)->format('Y-m-d'),
                'expiry_date' => optional($settings->iso_27001_expiry_date)->format('Y-m-d'),
            ],
            'iso_9001' => [
                'issue_date' => optional($settings->iso_9001_issue_date)->format('Y-m-d'),
                'expiry_date' => optional($settings->iso_9001_expiry_date)->format('Y-m-d'),
            ],
            'iso_14001' => [
                'issue_date' => optional($settings->iso_14001_issue_date)->format('Y-m-d'),
                'expiry_date' => optional($settings->iso_14001_expiry_date)->format('Y-m-d'),
            ],
            'company_incorporation' => [
                'issue_date' => optional($settings->company_incorporation_issue_date)->format('Y-m-d'),
                'expiry_date' => $settings->company_incorporation_expiry_date, // No format for permanent
            ],
            'vat_registration' => [
                'issue_date' => optional($settings->vat_registration_issue_date)->format('Y-m-d'),
                'expiry_date' => $settings->vat_registration_expiry_date, // No format for permanent
            ],
            'health_safety_policy' => [
                'issue_date' => optional($settings->health_safety_policy_issue_date)->format('Y-m-d'),
                'expiry_date' => $settings->health_safety_policy_expiry_date, // No format for reviewed annually
            ],
            'data_destruction_policy' => [
                'issue_date' => optional($settings->data_destruction_policy_issue_date)->format('Y-m-d'),
                'expiry_date' => $settings->data_destruction_policy_expiry_date,
            ],
            'environmental_policy' => [
                'issue_date' => optional($settings->environmental_policy_issue_date)->format('Y-m-d'),
                'expiry_date' => $settings->environmental_policy_expiry_date,
            ],
            'gdpr_compliance' => [
                'issue_date' => optional($settings->gdpr_compliance_issue_date)->format('Y-m-d'),
                'expiry_date' => $settings->gdpr_compliance_expiry_date,
            ],
        ];
    
        // Debug the formatted dates
        \Log::info('Document Dates:', [
            'formatted' => $documentDates
        ]);
    
        return Inertia::render('ClientArea/Information/Information', [
            'documents' => [
                'insurance_cover_url' => $settings?->insurance_cover_url,
                'environment_agency_url' => $settings?->environment_agency_url,
                'waste_carrier_url' => $settings?->waste_carrier_url,
                'iso_27001_url' => $settings?->iso_27001_url,
                'iso_9001_url' => $settings?->iso_9001_url,
                'iso_14001_url' => $settings?->iso_14001_url,
                'company_incorporation_url' => $settings?->company_incorporation_url,
                'vat_registration_url' => $settings?->vat_registration_url,
                'health_safety_policy_url' => $settings?->health_safety_policy_url,
                'data_destruction_policy_url' => $settings?->data_destruction_policy_url,
                'environmental_policy_url' => $settings?->environmental_policy_url,
                'gdpr_compliance_url' => $settings?->gdpr_compliance_url,
            ],
            'documentDates' => [
                'insurance_cover' => [
                    'issue_date' => optional($settings->insurance_cover_issue_date)->format('Y-m-d'),
                    'expiry_date' => optional($settings->insurance_cover_expiry_date)->format('Y-m-d'),
                ],
                'environment_agency' => [
                    'issue_date' => optional($settings->environment_agency_issue_date)->format('Y-m-d'),
                    'expiry_date' => optional($settings->environment_agency_expiry_date)->format('Y-m-d'),
                ],
                'waste_carrier' => [
                    'issue_date' => optional($settings->waste_carrier_issue_date)->format('Y-m-d'),
                    'expiry_date' => optional($settings->waste_carrier_expiry_date)->format('Y-m-d'),
                ],
                'iso_27001' => [
                    'issue_date' => optional($settings->iso_27001_issue_date)->format('Y-m-d'),
                    'expiry_date' => optional($settings->iso_27001_expiry_date)->format('Y-m-d'),
                ],
                'iso_9001' => [
                    'issue_date' => optional($settings->iso_9001_issue_date)->format('Y-m-d'),
                    'expiry_date' => optional($settings->iso_9001_expiry_date)->format('Y-m-d'),
                ],
                'iso_14001' => [
                    'issue_date' => optional($settings->iso_14001_issue_date)->format('Y-m-d'),
                    'expiry_date' => optional($settings->iso_14001_expiry_date)->format('Y-m-d'),
                ],
                'company_incorporation' => [
                    'issue_date' => optional($settings->company_incorporation_issue_date)->format('Y-m-d'),
                    'expiry_date' => $settings->company_incorporation_expiry_date, // No format for permanent
                ],
                'vat_registration' => [
                    'issue_date' => optional($settings->vat_registration_issue_date)->format('Y-m-d'),
                    'expiry_date' => $settings->vat_registration_expiry_date, // No format for permanent
                ],
                'health_safety_policy' => [
                    'issue_date' => optional($settings->health_safety_policy_issue_date)->format('Y-m-d'),
                    'expiry_date' => $settings->health_safety_policy_expiry_date, // No format for reviewed annually
                ],
                'data_destruction_policy' => [
                    'issue_date' => optional($settings->data_destruction_policy_issue_date)->format('Y-m-d'),
                    'expiry_date' => $settings->data_destruction_policy_expiry_date,
                ],
                'environmental_policy' => [
                    'issue_date' => optional($settings->environmental_policy_issue_date)->format('Y-m-d'),
                    'expiry_date' => $settings->environmental_policy_expiry_date,
                ],
                'gdpr_compliance' => [
                    'issue_date' => optional($settings->gdpr_compliance_issue_date)->format('Y-m-d'),
                    'expiry_date' => $settings->gdpr_compliance_expiry_date,
                ],
            ],
            'documentDetails' => $documents->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'document_type' => $doc->document_type,
                    'original_filename' => $doc->original_filename,
                    'file_path' => $doc->file_path,
                    'updated_at' => $doc->updated_at->format('Y-m-d'),
                ];
            })
        ]);
    }
}