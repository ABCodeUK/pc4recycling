<?php

namespace App\Http\Controllers;

use App\Models\Job;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SustainabilityController extends Controller
{
    public function index()
    {
        $mockJobs = [
            ['id' => 'J9999', 'date' => '2024-05-24'],
            ['id' => 'J9998', 'date' => '2024-05-20'],
            ['id' => 'J9997', 'date' => '2024-05-15'],
            ['id' => 'J9996', 'date' => '2024-05-10'],
            ['id' => 'J9995', 'date' => '2024-05-05'],
        ];

        $report = [
            'date' => now()->format('F j, Y'),
            'orderNumber' => 'O-11041',
            'orderDate' => '06/27/24',
            'materialSummary' => [
                'totalWeight' => 525.9,
                'totalItems' => 312,
                'recycledItems' => 35,
                'reusedItems' => 277,
            ],
            'reusedItems' => [
                ['type' => 'Tablet', 'quantity' => 271],
                ['type' => 'Monitor', 'quantity' => 2],
                ['type' => 'Notebook Computer', 'quantity' => 1],
                ['type' => 'Hard Disk Drive', 'quantity' => 1],
            ],
            'recycledItems' => [
                ['type' => 'Television', 'quantity' => 5],
                ['type' => 'Tablet', 'quantity' => 21],
                ['type' => 'All In One', 'quantity' => 1],
                ['type' => 'Monitor', 'quantity' => 2],
                ['type' => 'Network and Communication', 'quantity' => 2],
            ],
            'carbonOffset' => 58603,
            'costSavings' => 0,
            'equivalence' => [
                'waterConsumption' => 5684000,
                'energySavings' => 75209.60,
                'planeTrips' => 7380,          // Based on carbon offset equivalent
                'ghgEmissions' => 26.58,       // Converting 58,603 lbs to metric tons
                'smogFormation' => 142.5,      // Typical smog reduction from e-waste recycling
                'milesDriven' => 152368,       // Car miles equivalent of carbon offset
                'homeElectricity' => 8760,     // Annual home electricity savings in kWh
                'planeDistance' => 15240,      // Flight distance equivalent in miles
            ],
        ];

        return Inertia::render('ClientArea/Sustainability/Sustainability', [
            'report' => $report,
            'jobs' => $mockJobs
        ]);
    }

    public function show($jobId)
    {
        $job = Job::findOrFail($jobId);
        
        // TODO: Calculate sustainability metrics for specific job
        
        return Inertia::render('ClientArea/Sustainability/Sustainability', [
            'report' => [
                'date' => $job->created_at->format('F j, Y'),
                'orderNumber' => $job->job_number,
                'orderDate' => $job->collection_date->format('m/d/y'),
                // ... other metrics to be implemented
            ]
        ]);
    }
}