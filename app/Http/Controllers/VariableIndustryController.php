<?php

namespace App\Http\Controllers;

use App\Models\VariableIndustry;
use Inertia\Inertia;
use Illuminate\Http\Request;

class VariableIndustryController extends Controller
{
    /**
     * Display a listing of the customer types.
     */
    public function index()
    {
        // Fetch all Industries
        $industries = VariableIndustry::all();

        // Pass data to the Inertia template
        return Inertia::render('Settings/Variables/Industries/Industries', [
            'industries' => $industries,
        ]);
    }

    /**
     * Store a newly created Industry in storage.
     */
    public function store(Request $request)
    {
        // Validate the request
        $request->validate([
            'in_name' => 'required|unique:variable_industries,in_name|max:255',
        ]);

        // Create the new Industry
        $industry = VariableIndustry::create([
            'in_name' => $request->input('in_name'),
        ]);

        // Return the newly created Industry as JSON
        return response()->json($industry);
    }

    /**
     * Update an existing Industry in storage.
     */
    public function update(Request $request, $id)
    {
        // Validate the request
        $request->validate([
            'in_name' => "required|unique:variable_industries,in_name,{$id}|max:255",
        ]);

        // Find the existing Industry
        $industry = VariableIndustry::findOrFail($id);

        // Update the Industry
        $industry->update([
            'in_name' => $request->input('in_name'),
        ]);

        // Return the updated Industry as JSON
        return response()->json($industry);
    }

    /**
     * Delete a Industry from storage.
     */
    public function destroy($id)
    {
        $industry = VariableIndustry::findOrFail($id);
        $industry->delete();

        // Return success message as JSON
        return response()->json(['message' => 'Industry deleted successfully.']);
    }
}