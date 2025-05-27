<?php

namespace App\Http\Controllers;

use App\Models\SettingsTerm;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingsTermsController extends Controller
{
    public function index()
    {
        // Get the terms from the database (we'll have two records with IDs 1 and 2)
        $terms = SettingsTerm::all();
        
        // If there are no terms yet, create two empty records
        if ($terms->isEmpty()) {
            SettingsTerm::create(['terms' => '']);
            SettingsTerm::create(['terms' => '']);
            $terms = SettingsTerm::all();
        }
        
        return Inertia::render('Settings/Terms/Terms', [
            'terms' => $terms
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'terms' => 'required|string',
        ]);

        $term = SettingsTerm::findOrFail($id);
        $term->update([
            'terms' => $request->terms
        ]);

        return response()->json($term);
    }
}