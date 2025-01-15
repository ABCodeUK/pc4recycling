<?php

namespace App\Http\Controllers;

use App\Models\VariableLeadSource;
use Inertia\Inertia;
use Illuminate\Http\Request;

class VariableLeadSourceController extends Controller
{
    /**
     * Display a listing of the customer types.
     */
    public function index()
    {
        // Fetch all Lead Sources
        $leadSources = VariableLeadSource::all();

        // Pass data to the Inertia template
        return Inertia::render('Settings/Variables/LeadSources/LeadSources', [
            'leadSources' => $leadSources,
        ]);
    }

    /**
     * Store a newly created Lead Source in storage.
     */
    public function store(Request $request)
    {
        // Validate the request
        $request->validate([
            'ls_name' => 'required|unique:variable_lead_sources,ls_name|max:255',
        ]);

        // Create the new Lead Source
        $customerType = VariableLeadSource::create([
            'ls_name' => $request->input('ls_name'),
        ]);

        // Return the newly created Lead Source as JSON
        return response()->json($customerType);
    }

    /**
     * Update an existing Lead Source in storage.
     */
    public function update(Request $request, $id)
    {
        // Validate the request
        $request->validate([
            'ls_name' => "required|unique:variable_lead_sources,ls_name,{$id}|max:255",
        ]);

        // Find the existing Lead Source
        $customerType = VariableLeadSource::findOrFail($id);

        // Update the Lead Source
        $customerType->update([
            'ls_name' => $request->input('ls_name'),
        ]);

        // Return the updated Lead Source as JSON
        return response()->json($customerType);
    }

    /**
     * Delete a Lead Source from storage.
     */
    public function destroy($id)
    {
        $customerType = VariableLeadSource::findOrFail($id);
        $customerType->delete();

        // Return success message as JSON
        return response()->json(['message' => 'Lead Source deleted successfully.']);
    }
}