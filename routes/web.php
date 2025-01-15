<?php

// Settings Controllers
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\VariableEwcCodeController;
use App\Http\Controllers\VariableHPCodeController;
use App\Http\Controllers\VariableManufacturerController;
use App\Http\Controllers\VariableSpecFieldController;
use App\Http\Controllers\VariableCustomerTypeController;
use App\Http\Controllers\VariableLeadSourceController;
use App\Http\Controllers\VariableIndustryController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\SubCategoryController;
use App\Http\Controllers\ConnectionController;
use App\Http\Controllers\ChatGPTController;
use App\Http\Controllers\MySQLConnectionController;
use App\Http\Controllers\IceCatController;
use App\Http\Controllers\StaffAccountsController;

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Root route renders the Dashboard, redirect unauthenticated users to login
Route::get('/', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// ChatGPT Connection
Route::get('/settings/connections/chatgpt', [ChatGPTController::class, 'getConnection']);
Route::post('/settings/connections/chatgpt/connect', [ChatGPTController::class, 'connect']);
Route::post('/settings/connections/chatgpt/test', [ChatGPTController::class, 'test']);
Route::delete('/settings/connections/chatgpt', [ChatGPTController::class, 'disconnect']);

// MySQL Connection
    Route::prefix('settings/connections/mysql')->group(function () {
    Route::get('/', [MySQLConnectionController::class, 'getConnection'])->name('mysql.get');
    Route::post('/test', [MySQLConnectionController::class, 'testConnection'])->name('mysql.test');
    Route::post('/save', [MySQLConnectionController::class, 'saveConnection'])->name('mysql.save');
    Route::delete('/', [MySQLConnectionController::class, 'disconnect'])->name('mysql.disconnect');
});

// IceCat Connection
Route::get('/settings/connections/icecat', [IceCatController::class, 'getConnection']);
Route::post('/settings/connections/icecat/save', [IceCatController::class, 'saveConnection']);
Route::post('/settings/connections/icecat/test', [IceCatController::class, 'testConnection']);
Route::delete('/settings/connections/icecat', [IceCatController::class, 'disconnect']);

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

// Settings: CATEGORIES
Route::middleware('auth')->group(function () {
    // Main Categories Routes
    Route::get('/settings/categories', [CategoryController::class, 'index'])->name('categories.index');
    Route::post('/settings/categories', [CategoryController::class, 'store'])->name('categories.store');
    Route::put('/settings/categories/{id}', [CategoryController::class, 'update'])->name('categories.update');
    Route::delete('/settings/categories/{id}', [CategoryController::class, 'destroy'])->name('categories.destroy');
    Route::get('/settings/categories/{id}/edit', [CategoryController::class, 'edit'])->name('categories.edit');
});

// SubCategory Routes
Route::prefix('sub-categories')->group(function () {
    Route::post('/', [SubCategoryController::class, 'store'])->name('sub-categories.store');
    Route::put('/{id}', [SubCategoryController::class, 'update'])->name('sub-categories.update');
    Route::delete('/{id}', [SubCategoryController::class, 'destroy'])->name('sub-categories.destroy');
    Route::get('/{parent_id}', [SubCategoryController::class, 'index'])->name('sub-categories.index');
});

// Staff
Route::middleware(['auth'])->group(function () {
    Route::get('/settings/staff', [StaffAccountsController::class, 'index'])->name('staff.index'); // Staff list
    Route::get('/settings/staff/{id}/edit', [StaffAccountsController::class, 'edit'])->name('staff.edit'); // Edit staff
    Route::put('/settings/staff/update/{id}', [StaffAccountsController::class, 'update'])->name('staff.update');
    Route::post('/settings/staff/store', [StaffAccountsController::class, 'store'])->name('staff.store'); // Store new staff    
    Route::delete('/settings/staff/delete/{id}', [StaffAccountsController::class, 'destroy'])->name('staff.destroy'); // Delete staff
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

    // CUSTOMER TYPES
    Route::get('/settings/variables/customer-types', [VariableCustomerTypeController::class, 'index'])
    ->name('variables.customer-types');
    Route::post('/settings/variables/customer-types', [VariableCustomerTypeController::class, 'store'])
    ->name('variables.customer-types.store');
    Route::put('/settings/variables/customer-types/{id}', [VariableCustomerTypeController::class, 'update'])
    ->name('variables.customer-types.update');
    Route::delete('/settings/variables/customer-types/{id}', [VariableCustomerTypeController::class, 'destroy'])
    ->name('variables.customer-types.destroy');

    // LEAD SOURCES
    Route::get('/settings/variables/lead-sources', [VariableLeadSourceController::class, 'index'])
    ->name('variables.lead-sources');
    Route::post('/settings/variables/lead-sources', [VariableLeadSourceController::class, 'store'])
    ->name('variables.lead-sources.store');
    Route::put('/settings/variables/lead-sources/{id}', [VariableLeadSourceController::class, 'update'])
    ->name('variables.lead-sources.update');
    Route::delete('/settings/variables/lead-sources/{id}', [VariableLeadSourceController::class, 'destroy'])
    ->name('variables.lead-sources.destroy');

   // INDUSTRIES
   Route::get('/settings/variables/industries', [VariableIndustryController::class, 'index'])
   ->name('variables.industries');
   Route::post('/settings/variables/industries', [VariableIndustryController::class, 'store'])
   ->name('variables.industries.store');
   Route::put('/settings/variables/industries/{id}', [VariableIndustryController::class, 'update'])
   ->name('variables.industries.update');
   Route::delete('/settings/variables/industries/{id}', [VariableIndustryController::class, 'destroy'])
   ->name('variables.industries.destroy');
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

// Include authentication routes
require __DIR__.'/auth.php';
