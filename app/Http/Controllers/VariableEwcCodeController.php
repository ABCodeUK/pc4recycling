<?php

namespace App\Http\Controllers;

use App\Models\VariableEwcCode;
use Inertia\Inertia;
use Illuminate\Http\Request;

class VariableEwcCodeController extends Controller
{
    /**
     * Display a listing of the EWC codes.
     */
    public function index()
    {
        // Fetch all EWC codes
        $ewcCodes = VariableEwcCode::all();

        // Pass data to the Inertia template
        return Inertia::render('Settings/Variables/EwcCodes/EwcCodes', [
            'ewcCodes' => $ewcCodes,
        ]);
    }

    /**
     * Store a newly created EWC code in storage.
     */
    public function store(Request $request)
    {
        // Validate the request
        $request->validate([
            'ewc_code' => 'required|unique:variable_ewc_codes,ewc_code|max:255',
            'ea_description' => 'required|max:255',
        ]);

        // Create the new EWC code
        $ewcCode = VariableEwcCode::create([
            'ewc_code' => $request->input('ewc_code'),
            'ea_description' => $request->input('ea_description'),
        ]);

        // Return the newly created EWC code as JSON
        return response()->json($ewcCode);
    }

    /**
     * Update an existing EWC code in storage.
     */
    public function update(Request $request, $id)
    {
        // Validate the request
        $request->validate([
            'ewc_code' => "required|unique:variable_ewc_codes,ewc_code,{$id}|max:255",
            'ea_description' => 'required|max:255',
        ]);

        // Find the existing EWC code
        $ewcCode = VariableEwcCode::findOrFail($id);

        // Update the EWC code
        $ewcCode->update([
            'ewc_code' => $request->input('ewc_code'),
            'ea_description' => $request->input('ea_description'),
        ]);

        // Return the updated EWC code as JSON
        return response()->json($ewcCode);
    }

    /**
     * Delete an EWC code from storage.
     */
    public function destroy($id)
    {
        $ewcCode = VariableEwcCode::findOrFail($id);
        $ewcCode->delete();

        // Return success message as JSON
        return response()->json(['message' => 'EWC Code deleted successfully.']);
    }
}
