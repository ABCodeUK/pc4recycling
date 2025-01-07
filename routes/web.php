<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\VariableEwcCodeController;
use App\Http\Controllers\VariableHPCodeController;
use App\Http\Controllers\VariableManufacturerController;
use App\Http\Controllers\VariableSpecFieldController;
use App\Http\Controllers\ConnectionController; // Main ConnectionController
use App\Http\Controllers\ChatGPTController; // ChatGPT-specific Controller
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Root route renders the Dashboard, redirect unauthenticated users to login
Route::get('/', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// Dashboard route (kept for consistency)
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// Profile routes (requires authentication)
Route::middleware('auth')->group(function () {
    Route::get('/my-account', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/my-account', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/my-account', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Settings: Variables
Route::middleware('auth')->group(function () {
    // Main Variables page (defaults to EWC Codes content)
    Route::get('/settings/variables', function () {
        return redirect()->route('variables.ewc-codes');
    })->name('settings.variables');

    // EWC CODES
    Route::get('/settings/variables/ewc-codes', [VariableEwcCodeController::class, 'index'])
        ->name('variables.ewc-codes');
    Route::post('/settings/variables/ewc-codes', [VariableEwcCodeController::class, 'store'])
        ->name('variables.ewc-codes.store');
    Route::put('/settings/variables/ewc-codes/{id}', [VariableEwcCodeController::class, 'update'])
        ->name('variables.ewc-codes.update');
    Route::delete('/settings/variables/ewc-codes/{id}', [VariableEwcCodeController::class, 'destroy'])
        ->name('variables.ewc-codes.destroy');

    // HP CODES
    Route::get('/settings/variables/hp-codes', [VariableHPCodeController::class, 'index'])
        ->name('variables.hp-codes');
    Route::post('/settings/variables/hp-codes', [VariableHPCodeController::class, 'store'])
        ->name('variables.hp-codes.store');
    Route::put('/settings/variables/hp-codes/{id}', [VariableHPCodeController::class, 'update'])
        ->name('variables.hp-codes.update');
    Route::delete('/settings/variables/hp-codes/{id}', [VariableHPCodeController::class, 'destroy'])
        ->name('variables.hp-codes.destroy');

    // MANUFACTURERS
    Route::get('/settings/variables/manufacturers', [VariableManufacturerController::class, 'index'])
        ->name('variables.manufacturers');
    Route::post('/settings/variables/manufacturers', [VariableManufacturerController::class, 'store'])
        ->name('variables.manufacturers.store');
    Route::put('/settings/variables/manufacturers/{id}', [VariableManufacturerController::class, 'update'])
        ->name('variables.manufacturers.update');
    Route::delete('/settings/variables/manufacturers/{id}', [VariableManufacturerController::class, 'destroy'])
        ->name('variables.manufacturers.destroy');

    // SPEC FIELDS
    Route::get('/settings/variables/spec-fields', [VariableSpecFieldController::class, 'index'])
        ->name('variables.spec-fields');
    Route::post('/settings/variables/spec-fields', [VariableSpecFieldController::class, 'store'])
        ->name('variables.spec-fields.store');
    Route::put('/settings/variables/spec-fields/{id}', [VariableSpecFieldController::class, 'update'])
        ->name('variables.spec-fields.update');
    Route::delete('/settings/variables/spec-fields/{id}', [VariableSpecFieldController::class, 'destroy'])
        ->name('variables.spec-fields.destroy');

    // Customer Types Page
    Route::get('/settings/variables/customer-types', function () {
        return Inertia::render('Settings/Variables/CustomerTypes/CustomerTypes');
    })->name('variables.customer-types');

    // Lead Sources Page
    Route::get('/settings/variables/lead-sources', function () {
        return Inertia::render('Settings/Variables/LeadSources/LeadSources');
    })->name('variables.lead-sources');

    // Industries Page
    Route::get('/settings/variables/industries', function () {
        return Inertia::render('Settings/Variables/Industries/Industries');
    })->name('variables.industries');
});

// Settings: Connections
Route::middleware('auth')->group(function () {
    // Main connections page
    Route::get('/settings/connections', [ConnectionController::class, 'index'])->name('settings.connections');

    // API-specific routes
    Route::post('/settings/connections/chatgpt/connect', [ChatGPTController::class, 'connect'])
        ->name('settings.connections.chatgpt.connect');
    Route::post('/settings/connections/chatgpt/test', [ChatGPTController::class, 'test'])
        ->name('settings.connections.chatgpt.test');
});

// TEMPORARY ROUTES TO VIEW HIDDEN PAGES
Route::get('/test-confirm-password', function () {
    return Inertia::render('Auth/ConfirmPassword');
});

// Include authentication routes
require __DIR__.'/auth.php';
