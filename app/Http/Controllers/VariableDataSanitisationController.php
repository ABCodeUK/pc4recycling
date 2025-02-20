<?php

namespace App\Http\Controllers;

use App\Models\VariableDataSanitisation;
use Inertia\Inertia;
use Illuminate\Http\Request;

class VariableDataSanitisationController extends Controller
{
    public function index()
    {
        $dataSanitisationOptions = VariableDataSanitisation::all();

        return Inertia::render('Settings/Variables/DataSanitisation/DataSanitisation', [
            'dataSanitisationOptions' => $dataSanitisationOptions,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'ds_name' => 'required|unique:variable_data_sanitisation,ds_name|max:255',
        ]);

        $dataSanitisation = VariableDataSanitisation::create([
            'ds_name' => $request->input('ds_name'),
        ]);

        return response()->json($dataSanitisation);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'ds_name' => "required|unique:variable_data_sanitisation,ds_name,{$id}|max:255",
        ]);

        $dataSanitisation = VariableDataSanitisation::findOrFail($id);
        $dataSanitisation->update([
            'ds_name' => $request->input('ds_name'),
        ]);

        return response()->json($dataSanitisation);
    }

    public function destroy($id)
    {
        $dataSanitisation = VariableDataSanitisation::findOrFail($id);
        $dataSanitisation->delete();

        return response()->json(['message' => 'Data Sanitisation option deleted successfully.']);
    }
}