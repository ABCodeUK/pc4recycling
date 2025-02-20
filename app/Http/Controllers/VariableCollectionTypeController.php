<?php

namespace App\Http\Controllers;

use App\Models\VariableCollectionType;
use Inertia\Inertia;
use Illuminate\Http\Request;

class VariableCollectionTypeController extends Controller
{
    public function index()
    {
        $collectionTypes = VariableCollectionType::all();

        return Inertia::render('Settings/Variables/CollectionTypes/CollectionTypes', [
            'collectionTypes' => $collectionTypes,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'colt_name' => 'required|unique:variable_collection_types,colt_name|max:255',
            'colt_description' => 'nullable|max:255',  // Add validation for description
        ]);

        $collectionType = VariableCollectionType::create([
            'colt_name' => $request->input('colt_name'),
            'colt_description' => $request->input('colt_description'),  // Add description
        ]);

        return response()->json($collectionType);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'colt_name' => "required|unique:variable_collection_types,colt_name,{$id}|max:255",
            'colt_description' => 'nullable|max:255',  // Add validation for description
        ]);

        $collectionType = VariableCollectionType::findOrFail($id);

        $collectionType->update([
            'colt_name' => $request->input('colt_name'),
            'colt_description' => $request->input('colt_description'),  // Add description
        ]);

        return response()->json($collectionType);
    }

    public function destroy($id)
    {
        $collectionType = VariableCollectionType::findOrFail($id);
        $collectionType->delete();

        return response()->json(['message' => 'Collection Type deleted successfully.']);
    }
}