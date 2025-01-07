<?php

namespace App\Http\Controllers;

use App\Models\VariableSpecField;
use Inertia\Inertia;
use Illuminate\Http\Request;

class VariableSpecFieldController extends Controller
{
    /**
     * Display a listing of the Spec Fields.
     */
    public function index()
    {
        // Fetch all Spec Fields
        $specFields = VariableSpecField::all();

        // Pass data to the Inertia template
        return Inertia::render('Settings/Variables/SpecFields/SpecFields', [
            'specFields' => $specFields,
        ]);
    }

    /**
     * Store a newly created Spec Field in storage.
     */
    public function store(Request $request)
    {
        // Validate the request
        $request->validate([
            'spec_name' => 'required|unique:variable_spec_fields,spec_name|max:255',
            'spec_order' => 'required|integer|min:1',
            'spec_default' => 'required|boolean',
        ]);

        // Create the new Spec Field
        $specField = VariableSpecField::create([
            'spec_name' => $request->input('spec_name'),
            'spec_order' => $request->input('spec_order'),
            'spec_default' => $request->input('spec_default'),
        ]);

        // Return the newly created Spec Field as JSON
        return response()->json($specField);
    }

    /**
     * Update an existing Spec Field in storage.
     */
    public function update(Request $request, $id)
    {
        // Find the existing Spec Field
        $specField = VariableSpecField::findOrFail($id);

        // Prevent updating default items if needed
        if ($specField->spec_default) {
            return response()->json([
                'message' => 'Default Spec Fields cannot be updated.',
            ], 403);
        }

        // Validate the request
        $request->validate([
            'spec_name' => "required|unique:variable_spec_fields,spec_name,{$id}|max:255",
            'spec_order' => 'required|integer|min:1',
            'spec_default' => 'required|boolean',
        ]);

        // Update the Spec Field
        $specField->update([
            'spec_name' => $request->input('spec_name'),
            'spec_order' => $request->input('spec_order'),
            'spec_default' => $request->input('spec_default'),
        ]);

        // Return the updated Spec Field as JSON
        return response()->json($specField);
    }

    /**
     * Delete a Spec Field from storage.
     */
    public function destroy($id)
    {
        $specField = VariableSpecField::findOrFail($id);

        // Prevent deletion of default Spec Fields
        if ($specField->spec_default) {
            return response()->json([
                'message' => 'Default Spec Fields cannot be deleted.',
            ], 403);
        }

        $specField->delete();

        // Return success message as JSON
        return response()->json(['message' => 'Spec Field deleted successfully.']);
    }
}
