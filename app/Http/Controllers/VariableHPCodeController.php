<?php

namespace App\Http\Controllers;

use App\Models\VariableHPCode;
use Inertia\Inertia;
use Illuminate\Http\Request;

class VariableHPCodeController extends Controller
{
    /**
     * Display a listing of the HP codes.
     */
    public function index()
    {
        // Fetch all HP codes
        $hpCodes = VariableHPCode::all();

        // Pass data to the Inertia template
        return Inertia::render('Settings/Variables/HPCodes/HPCodes', [
            'hpCodes' => $hpCodes,
        ]);
    }

    /**
     * Store a newly created HP Code in storage.
     */
    public function store(Request $request)
    {
        // Validate the request
        $request->validate([
            'hp_code' => 'required|unique:variable_hp_codes,hp_code|max:255',
            'hp_type' => 'required|max:255',
            'hp_description' => 'nullable|max:255', // Updated to make it optional
        ]);

        // Create the new HP Code
        $hpCode = VariableHPCode::create([
            'hp_code' => $request->input('hp_code'),
            'hp_type' => $request->input('hp_type'),
            'hp_description' => $request->input('hp_description') ?? '', // Default to empty string if not provided
        ]);

        // Return the newly created HP Code as JSON
        return response()->json($hpCode);
    }

    /**
     * Update an existing HP Code in storage.
     */
    public function update(Request $request, $id)
    {
        // Validate the request
        $request->validate([
            'hp_code' => "required|unique:variable_hp_codes,hp_code,{$id}|max:255",
            'hp_type' => 'required|max:255',
            'hp_description' => 'nullable|max:255', // Updated to make it optional
        ]);

        // Find the existing HP Code
        $hpCode = VariableHPCode::findOrFail($id);

        // Update the HP Code
        $hpCode->update([
            'hp_code' => $request->input('hp_code'),
            'hp_type' => $request->input('hp_type'),
            'hp_description' => $request->input('hp_description') ?? '', // Default to empty string if not provided
        ]);

        // Return the updated HP Code as JSON
        return response()->json($hpCode);
    }

    /**
     * Delete an HP Code from storage.
     */
    public function destroy($id)
    {
        $hpCode = VariableHPCode::findOrFail($id);
        $hpCode->delete();

        // Return success message as JSON
        return response()->json(['message' => 'HP Code deleted successfully.']);
    }
}
