<?php

namespace App\Http\Controllers;

use App\Models\Job;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JobController extends Controller
{
    public function index(Request $request)
    {
        $status = match ($request->path()) {
            'collections' => ['Needs Scheduling', 'Request Pending', 'Scheduled', 'Postponed'],
            'processing' => ['Collected', 'Processing'],
            'completed' => ['Complete', 'Canceled'],
            default => ['Needs Scheduling', 'Request Pending', 'Scheduled', 'Postponed'],
        };

        $jobs = Job::with('client')
            ->whereIn('job_status', $status)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Jobs/' . ucfirst($request->path()) . '/' . ucfirst($request->path()), [
            'jobs' => $jobs->items(),
            'pagination' => [
                'total' => $jobs->total(),
                'currentPage' => $jobs->currentPage(),
                'perPage' => $jobs->perPage(),
            ],
            'collection_types' => Job::$collectionTypes,
            'sanitisation_options' => Job::$sanitisationOptions
        ]);
    }

    public function create()
    {
        $clients = User::where('type', 'client')->get();

        return Inertia::render('Jobs/Create', [
            'clients' => $clients,
            'collection_types' => Job::$collectionTypes,
            'sanitisation_options' => Job::$sanitisationOptions,
            'status_options' => Job::$statuses,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:users,id',
            'collection_date' => 'nullable|date',
            'job_status' => 'required|in:' . implode(',', Job::$statuses),
            'staff_collecting' => 'nullable|string',
            'vehicle' => 'nullable|string',
            'address' => 'required|string',
            'town_city' => 'required|string',
            'postcode' => 'required|string',
            'onsite_contact' => 'nullable|string',
            'onsite_number' => 'nullable|string',
            'onsite_email' => 'nullable|email',
            'collection_type' => 'required|in:' . implode(',', Job::$collectionTypes),
            'data_sanitisation' => 'required|in:' . implode(',', Job::$sanitisationOptions),
            'sla' => 'nullable|string',
            'instructions' => 'nullable|string',
        ]);

        $validated['job_id'] = Job::generateJobId();
        $job = Job::create($validated);

        return redirect()->route('collections.index')->with('success', 'Job created successfully');
    }

    public function edit($id)
    {
        $job = Job::with('client')->findOrFail($id);
        $clients = User::where('type', 'client')->get();

        if (!$job->isEditable()) {
            return redirect()->back()->with('error', 'This job cannot be edited');
        }

        return Inertia::render('Jobs/Edit', [
            'job' => $job,
            'clients' => $clients,
            'collection_types' => Job::$collectionTypes,
            'sanitisation_options' => Job::$sanitisationOptions,
            'status_options' => Job::$statuses,
        ]);
    }

    public function update(Request $request, $id)
    {
        $job = Job::findOrFail($id);

        if (!$job->isEditable()) {
            return redirect()->back()->with('error', 'This job cannot be edited');
        }

        $validated = $request->validate([
            'client_id' => 'required|exists:users,id',
            'collection_date' => 'nullable|date',
            'job_status' => 'required|in:' . implode(',', Job::$statuses),
            'staff_collecting' => 'nullable|string',
            'vehicle' => 'nullable|string',
            'address' => 'required|string',
            'town_city' => 'required|string',
            'postcode' => 'required|string',
            'onsite_contact' => 'nullable|string',
            'onsite_number' => 'nullable|string',
            'onsite_email' => 'nullable|email',
            'collection_type' => 'required|in:' . implode(',', Job::$collectionTypes),
            'data_sanitisation' => 'required|in:' . implode(',', Job::$sanitisationOptions),
            'sla' => 'nullable|string',
            'instructions' => 'nullable|string',
        ]);

        $job->update($validated);

        return redirect()->back()->with('success', 'Job updated successfully');
    }

    public function destroy($id)
    {
        $job = Job::findOrFail($id);

        if (!$job->isEditable()) {
            return redirect()->back()->with('error', 'This job cannot be deleted');
        }

        $job->delete();
        return redirect()->back()->with('success', 'Job deleted successfully');
    }
}