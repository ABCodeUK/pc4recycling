<?php

// Settings Controllers
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\VariableEwcCodeController;
use App\Http\Controllers\VariableHPCodeController;
use App\Http\Controllers\VariableManufacturerController;
use App\Http\Controllers\VariableSpecFieldController;
use App\Http\Controllers\VariableCustomerTypeController;
use App\Http\Controllers\VariableCollectionTypeController;
use App\Http\Controllers\VariableDataSanitisationController;
use App\Http\Controllers\VariableLeadSourceController;
use App\Http\Controllers\VariableIndustryController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\SubCategoryController;
use App\Http\Controllers\ConnectionController;
use App\Http\Controllers\ChatGPTController;
use App\Http\Controllers\IMEIController;
use App\Http\Controllers\IMEICheckerController;
use App\Http\Controllers\MySQLConnectionController;
use App\Http\Controllers\IceCatController;
use App\Http\Controllers\ClientDashboardJobsController;
use App\Http\Controllers\StaffAccountsController;
use App\Http\Controllers\StaffRolesController;
use App\Http\Controllers\ClientAccountsController;
use App\Http\Controllers\ClientAddressController;
use App\Http\Controllers\ClientJobController;
use App\Http\Controllers\ClientQuoteController;
use App\Http\Controllers\ClientSubController;
use App\Http\Controllers\JobController;
use App\Http\Controllers\JobItemController;
use App\Http\Controllers\JobDocumentController;
use App\Http\Controllers\JobAuditController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\PrivacyPolicyController;
use App\Http\Controllers\CompanySettingController;
use App\Http\Controllers\SustainabilityController;
use App\Http\Controllers\SettingsTermsController;
use Illuminate\Support\Facades\Route;

use Inertia\Inertia;

// Include authentication routes
require __DIR__.'/auth.php';

// After successful login, ensure user data is properly loaded
Route::get('/', function () {
    // Ensure user is fully loaded with all relationships
    $user = Auth::user()->fresh()->load('staffDetails.role');
    
    return Inertia::render('Dashboard/Dashboard', [
        'user' => $user
    ]);
})->middleware(['auth', 'verified'])->name('home');

// Admin Dashboard route (kept for consistency)
Route::get('/dashboard', function () {
    // Ensure user is fully loaded with all relationships
    $user = Auth::user()->fresh()->load('staffDetails.role');
    
    return Inertia::render('Dashboard/Dashboard', [
        'user' => $user
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

// Admin Profile routes (requires authentication)
Route::middleware('auth')->group(function () {
    Route::get('/my-account', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/my-account', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/my-account', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Settings: CATEGORIES
Route::middleware('auth')->group(function () {
    Route::get('/settings/categories', [CategoryController::class, 'index'])->name('categories.index'); // Categories List
    Route::post('/settings/categories', [CategoryController::class, 'store'])->name('categories.store'); // Categories Store
    Route::put('/settings/categories/{id}', [CategoryController::class, 'update'])->name('categories.update'); // Categories Update
    Route::delete('/settings/categories/{id}', [CategoryController::class, 'destroy'])->name('categories.destroy'); // Categories Delete
    Route::get('/settings/categories/{id}/edit', [CategoryController::class, 'edit'])->name('categories.edit'); // Categories Edit
});

// Sub-Category Routes
Route::prefix('sub-categories')->group(function () {
    Route::get('/{parent_id}', [SubCategoryController::class, 'index'])->name('sub-categories.index');  // Sub-Category list
    Route::post('/', [SubCategoryController::class, 'store'])->name('sub-categories.store'); // Sub-Category Store
    Route::put('/{id}', [SubCategoryController::class, 'update'])->name('sub-categories.update'); // Sub-Category Update
    Route::delete('/{id}', [SubCategoryController::class, 'destroy'])->name('sub-categories.destroy'); // Sub-Category Delete
});

// Client Accounts
Route::middleware(['auth'])->group(function () {
    Route::get('/customers', [ClientAccountsController::class, 'index'])->name('client.index'); // Client Account list
    Route::get('/customers/{id}', [ClientAccountsController::class, 'view'])->name('client.view'); // Client Account View
    Route::get('/customers/{id}/edit', [ClientAccountsController::class, 'edit'])->name('client.edit'); // Client Account Edit
    Route::post('/customers/store', [ClientAccountsController::class, 'store'])->name('client.store'); // Client Account Store
    Route::put('/customers/update/{id}', [ClientAccountsController::class, 'update'])->name('client.update'); // Client Account Update
    Route::delete('/customers/delete/{id}', [ClientAccountsController::class, 'destroy'])->name('client.destroy');  // Client Account Delete
    Route::post('/customers/{id}/reset-password', [ClientAccountsController::class, 'resetPassword']); // Client Account Reset Password
    Route::post('/customers/{id}/send-reset-email', [ClientAccountsController::class, 'sendResetEmail']); // Client Account Send Password Reset Email
});
    Route::get('/customers/{id}/default-address', [ClientAccountsController::class, 'getDefaultAddress']);
    Route::get('/customers/{id}/jobs', [ClientJobController::class, 'index'])->name('customers.jobs');

// Client Address Routes
Route::prefix('addresses')->group(function () {
    Route::get('/{parent_id}', [ClientAddressController::class, 'index'])->name('addresses.index');  // Address list
    Route::post('/', [ClientAddressController::class, 'store'])->name('addresses.store');         // Store Address
    Route::put('/{id}', [ClientAddressController::class, 'update'])->name('addresses.update');    // Update Address
    Route::delete('/{id}', [ClientAddressController::class, 'destroy'])->name('addresses.destroy'); // Delete Address
});

// Jobs
Route::middleware('auth')->group(function () {
    // Quotes - Basic routes without status check
    Route::get('/quotes/next-job-id', [JobController::class, 'getNextJobId'])->name('quotes.next-job-id');
    Route::get('/quotes/', [JobController::class, 'index'])->name('quotes.index');
    Route::post('/quotes', [JobController::class,'store'])->name('quotes.store');
    Route::delete('/quotes/{id}', [JobController::class, 'destroy'])->name('quotes.destroy');

    // Collections - Basic routes without status check
    Route::get('/collections/next-job-id', [JobController::class, 'getNextJobId'])->name('collections.next-job-id');
    Route::get('/collections/', [JobController::class, 'index'])->name('collections.index');
    Route::post('/collections', [JobController::class, 'store'])->name('collections.store');
    Route::delete('/collections/{id}', [JobController::class, 'destroy'])->name('collections.destroy');

    // Processing - Basic routes without status check
    Route::get('/processing/', [JobController::class, 'index'])->name('processing.index');
    Route::get('/processing/next-job-id', [JobController::class, 'getNextJobId'])->name('processing.next-job-id');

    // Completed - Basic routes without status check
    Route::get('/completed/', [JobController::class, 'index'])->name('completed.index');
    Route::post('/completed/', [JobController::class, 'store'])->name('completed.store');
    Route::delete('/completed/{id}', [JobController::class, 'destroy'])->name('completed.destroy');


    // Use full class name instead of alias
    Route::middleware(App\Http\Middleware\JobStatusRedirect::class)->group(function () {
        // Collections view/edit with status check
        Route::get('/quotes/{id}', [JobController::class, 'show'])->name('quotes.show');
        Route::get('/quotes/{id}/edit', [JobController::class, 'edit'])->name('quotes.edit');
        Route::put('/quotes/{id}', [JobController::class, 'update'])->name('quotes.update');
      
        // Collections view/edit with status check
        Route::get('/collections/{id}', [JobController::class, 'show'])->name('collections.show');
        Route::get('/collections/{id}/edit', [JobController::class, 'edit'])->name('collections.edit');
        Route::put('/collections/{id}', [JobController::class, 'update'])->name('collections.update');
        
        // Processing view/edit with status check
        Route::get('/processing/{id}', [JobController::class, 'show'])->name('processing.show');
        Route::get('/processing/{id}/edit', [JobController::class, 'edit'])->name('processing.edit');
        Route::put('/processing/{id}', [JobController::class, 'update'])->name('processing.update');

        // Completed view/edit with status check
        Route::get('/completed/{id}/edit', [JobController::class, 'edit'])->name('completed.edit');
        Route::put('/completed/{id}', [JobController::class, 'update'])->name('completed.update');
    });

    // Job Items routes
Route::get('/api/categories', [CategoryController::class, 'getCategories']);
Route::get('/api/jobs/{jobId}/items', [JobItemController::class, 'index']);
Route::post('/api/jobs/{jobId}/items', [JobItemController::class, 'store']);
Route::put('/api/jobs/{jobId}/items/{itemId}', [JobItemController::class, 'update']);
Route::delete('/api/jobs/{jobId}/items/{itemId}', [JobItemController::class, 'destroy']);
Route::get('/api/jobs/{jobId}/generate-item-number', [JobItemController::class, 'generateItemNumber']);
Route::post('/api/jobs/{jobId}/mark-collected', [JobController::class, 'markAsCollected']);
Route::post('/collections/{id}/mark-collected', [JobController::class, 'markAsCollected'])->name('collections.mark-collected');
Route::post('/api/jobs/{jobId}/mark-received', [JobController::class, 'markAsReceived'])->name('jobs.mark-received');
Route::post('/api/jobs/{jobId}/mark-processing', [JobController::class, 'markAsProcessing'])->name('jobs.mark-processing');
Route::post('/api/jobs/{jobId}/mark-quote-rejected', [JobController::class, 'markAsQuoteRejected'])->name('jobs.mark-quote-rejected');
Route::post('/api/jobs/{jobId}/mark-completed', [JobController::class, 'markCompleted'])->name('jobs.mark-completed');
Route::post('/api/jobs/{jobId}/provide-quote', [JobController::class, 'provideQuote'])->name('jobs.provide-quote');
});

// Staff Accounts
Route::middleware(['auth'])->group(function () {
    Route::get('/settings/staff', [StaffAccountsController::class, 'index'])->name('staff.index'); // Staff list
    Route::get('/settings/staff/{id}/edit', [StaffAccountsController::class, 'edit'])->name('staff.edit'); // Edit staff
    Route::post('/settings/staff/store', [StaffAccountsController::class, 'store'])->name('staff.store'); // Store new staff 
    Route::put('/settings/staff/update/{id}', [StaffAccountsController::class, 'update'])->name('staff.update'); // Update Staff   
    Route::delete('/settings/staff/delete/{id}', [StaffAccountsController::class, 'destroy'])->name('staff.destroy'); // Delete staff
    Route::post('/settings/staff/{id}/reset-password', [StaffAccountsController::class, 'resetPassword']); // Reset staff password
    Route::post('/settings/staff/{id}/send-reset-email', [StaffAccountsController::class, 'sendResetEmail']); // Staff password reset email
});

// Staff Roles
Route::middleware(['auth'])->group(function () {
    Route::get('/settings/staff/roles', [StaffRolesController::class, 'index'])->name('roles.index'); // Staff Roles List
    Route::post('/settings/staff/roles', [StaffRolesController::class, 'store'])->name('roles.store'); // Staff Roles Store
    Route::put('/settings/staff/roles/{id}', [StaffRolesController::class, 'update'])->name('roles.update'); // Staff Roles Update
    Route::delete('/settings/staff/roles/{id}', [StaffRolesController::class, 'destroy'])->name('roles.destroy'); // Staff Roles Delete
});

// Settings: Variables
Route::middleware('auth')->group(function () {
    // Main Variables page (defaults to EWC Codes content)
    Route::get('/settings/variables', function () {
        return redirect()->route('variables.ewc-codes'); })->name('settings.variables');

    // General Settings
    Route::get('/settings/documents', [CompanySettingController::class, 'index'])->name('settings.documents');
    Route::post('/settings/documents/documents', [CompanySettingController::class, 'store']);
    Route::post('/settings/documents/documents/{id}', [CompanySettingController::class, 'update']);
    Route::delete('/settings/documents/documents/{id}', [CompanySettingController::class, 'deleteDocument']);
    Route::get('/settings/documents/documents/{id}/download', [CompanySettingController::class, 'downloadDocument']);
    // EWC CODES
    Route::get('/settings/variables/ewc-codes', [VariableEwcCodeController::class, 'index'])->name('variables.ewc-codes');
    Route::post('/settings/variables/ewc-codes', [VariableEwcCodeController::class, 'store'])->name('variables.ewc-codes.store');
    Route::put('/settings/variables/ewc-codes/{id}', [VariableEwcCodeController::class, 'update'])->name('variables.ewc-codes.update');
    Route::delete('/settings/variables/ewc-codes/{id}', [VariableEwcCodeController::class, 'destroy'])->name('variables.ewc-codes.destroy');

    // HP CODES
    Route::get('/settings/variables/hp-codes', [VariableHPCodeController::class, 'index'])->name('variables.hp-codes');
    Route::post('/settings/variables/hp-codes', [VariableHPCodeController::class, 'store'])->name('variables.hp-codes.store');
    Route::put('/settings/variables/hp-codes/{id}', [VariableHPCodeController::class, 'update'])->name('variables.hp-codes.update');
    Route::delete('/settings/variables/hp-codes/{id}', [VariableHPCodeController::class, 'destroy'])->name('variables.hp-codes.destroy');

    // MANUFACTURERS
    Route::get('/settings/variables/manufacturers', [VariableManufacturerController::class, 'index'])->name('variables.manufacturers');
    Route::post('/settings/variables/manufacturers', [VariableManufacturerController::class, 'store'])->name('variables.manufacturers.store');
    Route::put('/settings/variables/manufacturers/{id}', [VariableManufacturerController::class, 'update'])->name('variables.manufacturers.update');
    Route::delete('/settings/variables/manufacturers/{id}', [VariableManufacturerController::class, 'destroy'])->name('variables.manufacturers.destroy');

    // SPEC FIELDS
    Route::get('/settings/variables/spec-fields', [VariableSpecFieldController::class, 'index'])->name('variables.spec-fields');
    Route::post('/settings/variables/spec-fields', [VariableSpecFieldController::class, 'store'])->name('variables.spec-fields.store');
    Route::put('/settings/variables/spec-fields/{id}', [VariableSpecFieldController::class, 'update'])->name('variables.spec-fields.update');
    Route::delete('/settings/variables/spec-fields/{id}', [VariableSpecFieldController::class, 'destroy'])->name('variables.spec-fields.destroy');

    // CUSTOMER TYPES
    Route::get('/settings/variables/customer-types', [VariableCustomerTypeController::class, 'index'])->name('variables.customer-types');
    Route::post('/settings/variables/customer-types', [VariableCustomerTypeController::class, 'store'])->name('variables.customer-types.store');
    Route::put('/settings/variables/customer-types/{id}', [VariableCustomerTypeController::class, 'update'])->name('variables.customer-types.update');
    Route::delete('/settings/variables/customer-types/{id}', [VariableCustomerTypeController::class, 'destroy'])->name('variables.customer-types.destroy');

    // LEAD SOURCES
    Route::get('/settings/variables/lead-sources', [VariableLeadSourceController::class, 'index'])->name('variables.lead-sources');
    Route::post('/settings/variables/lead-sources', [VariableLeadSourceController::class, 'store'])->name('variables.lead-sources.store');
    Route::put('/settings/variables/lead-sources/{id}', [VariableLeadSourceController::class, 'update'])->name('variables.lead-sources.update');
    Route::delete('/settings/variables/lead-sources/{id}', [VariableLeadSourceController::class, 'destroy'])->name('variables.lead-sources.destroy');

   // INDUSTRIES
   Route::get('/settings/variables/industries', [VariableIndustryController::class, 'index'])->name('variables.industries');
   Route::post('/settings/variables/industries', [VariableIndustryController::class, 'store'])->name('variables.industries.store');
   Route::put('/settings/variables/industries/{id}', [VariableIndustryController::class, 'update'])->name('variables.industries.update');
   Route::delete('/settings/variables/industries/{id}', [VariableIndustryController::class, 'destroy'])->name('variables.industries.destroy');

    // Collection Types
    Route::get('/settings/variables/collection-types', [VariableCollectionTypeController::class, 'index'])->name('variables.collection-types'); // Fixed typo in name
    Route::post('/settings/variables/collection-types', [VariableCollectionTypeController::class, 'store'])->name('variables.collection-types.store');
    Route::put('/settings/variables/collection-types/{id}', [VariableCollectionTypeController::class, 'update'])->name('variables.collection-types.update');
    Route::delete('/settings/variables/collection-types/{id}', [VariableCollectionTypeController::class, 'destroy'])->name('variables.collection-types.destroy');

        // Data Sanitisation
        Route::get('/settings/variables/data-sanitisation', [VariableDataSanitisationController::class, 'index'])->name('variables.data-sanitisation'); // Fixed typo in name
        Route::post('/settings/variables/data-sanitisation', [VariableDataSanitisationController::class, 'store'])->name('variables.data-sanitisation.store');
        Route::put('/settings/variables/data-sanitisation/{id}', [VariableDataSanitisationController::class, 'update'])->name('variables.data-sanitisation.update');
        Route::delete('/settings/variables/data-sanitisation/{id}', [VariableDataSanitisationController::class, 'destroy'])->name('variables.data-sanitisation.destroy');
});

// Calendar
Route::get('/calendar', [CalendarController::class, 'index'])
    ->middleware(['auth']);

// Settings: Connections
Route::middleware('auth')->group(function () {
    // Main connections page
    Route::get('/settings/connections', [ConnectionController::class, 'index'])->name('settings.connections');

    // CHATGPT API-specific routes
    Route::post('/settings/connections/chatgpt/connect', [ChatGPTController::class, 'connect'])->name('settings.connections.chatgpt.connect');
    Route::post('/settings/connections/chatgpt/test', [ChatGPTController::class, 'test'])->name('settings.connections.chatgpt.test');

    // IMEI API-specific routes
    Route::post('/settings/connections/imei/connect', [IMEIController::class, 'connect'])->name('settings.connections.imei.connect');
    Route::post('/settings/connections/imei/test', [IMEIController::class, 'test'])->name('settings.connections.imei.test');
});

// ChatGPT Connection
Route::get('/settings/connections/chatgpt', [ChatGPTController::class, 'getConnection']);
Route::post('/settings/connections/chatgpt/connect', [ChatGPTController::class, 'connect']);
Route::post('/settings/connections/chatgpt/test', [ChatGPTController::class, 'test']);
Route::delete('/settings/connections/chatgpt', [ChatGPTController::class, 'disconnect']);

// IMEI Connection
Route::get('/settings/connections/imei', [IMEIController::class, 'getConnection']);
Route::post('/settings/connections/imei/connect', [IMEIController::class, 'connect']);
Route::post('/settings/connections/imei/test', [IMEIController::class, 'test']);
Route::delete('/settings/connections/imei', [IMEIController::class, 'disconnect']);
 
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

// Add these with your other routes
Route::get('/api/dashboard-metrics', [DashboardController::class, 'getMetrics'])
    ->middleware(['auth'])
    ->name('dashboard.metrics');

Route::get('/api/upcoming-jobs', [DashboardController::class, 'getUpcomingJobs'])
    ->middleware(['auth'])
    ->name('dashboard.upcoming-jobs');

    Route::get('/api/driver-jobs', [DashboardController::class, 'getDriverJobs'])
    ->middleware(['auth'])
    ->name('dashboard.driver-jobs');

    // Sub-client routes
Route::middleware(['auth'])->group(function () {
    Route::get('/customers/{id}/sub-clients', [ClientSubController::class, 'index']);
    Route::post('/sub-clients', [ClientSubController::class, 'store']);
    Route::put('/sub-clients/{id}', [ClientSubController::class, 'update']);
    Route::delete('/sub-clients/{id}', [ClientSubController::class, 'destroy']);
});

// Job Documents routes
Route::middleware('auth')->group(function () {
    Route::post('/collections/{id}/documents', [JobDocumentController::class, 'store'])->name('job.documents.store');
    Route::delete('/collections/{jobId}/documents/{documentId}', [JobDocumentController::class, 'destroy'])->name('job.documents.destroy');
    Route::get('/documents/{jobId}/{uuid}', [JobDocumentController::class, 'show'])->name('documents.show');
});

// Job Audit routes
// Inside the Job Audit routes group
Route::middleware('auth')->group(function () {
    Route::get('/api/jobs/{jobId}/audit', [JobAuditController::class, 'index']);
    Route::post('/api/jobs/{jobId}/audit', [JobAuditController::class, 'store']);
    Route::put('/api/jobs/{jobId}/audit/{entryId}', [JobAuditController::class, 'update']);
    Route::delete('/api/jobs/{jobId}/audit/{entryId}', [JobAuditController::class, 'destroy']);
});


Route::get('/settings/terms', [SettingsTermsController::class, 'index'])->name('settings.terms');
Route::put('/settings/terms/{id}', [SettingsTermsController::class, 'update'])->name('settings.terms.update');

Route::get('/api/user', function () {
    if (Auth::check()) {
        return Auth::user()->load('staffDetails.role');
    }
    return response()->json(null, 401);
})->middleware('auth');
// Add this route to your web.php file
// Replace the existing client-jobs route with this
Route::get('/api/client-dashboard-jobs', [ClientDashboardJobsController::class, 'index'])
    ->middleware(['auth'])
    ->name('dashboard.client-dashboard-jobs');
// Add this route with your other job routes
Route::get('/jobs/{jobId}/hazardous-waste-note', [JobController::class, 'generateHazardousWasteNote']) ->name('jobs.hazardous-waste-note');

// Client Collection Booking Routes
Route::middleware(['auth'])->group(function () {
    Route::get('/request-collection', function () {
        return Inertia::render('ClientArea/BookJob/BookCollection', [
            'addresses' => Auth::user()->addresses,
            'collection_types' => \App\Models\VariableCollectionType::all(),
            'sanitisation_options' => \App\Models\VariableDataSanitisation::all(),
        ]);
    })->name('request-collection');

    Route::post('/request-collection', [JobController::class, 'storeClientRequest'])
        ->name('request-collection.store');
});
// Privacy Policy
Route::post('/privacy-policy/accept', [PrivacyPolicyController::class, 'accept'])
    ->middleware(['auth'])
    ->name('privacy-policy.accept');

// Client Information Routes
Route::middleware(['auth'])->group(function () {
    Route::get('/information', [CompanySettingController::class, 'information'])->name('information');
        
    // Add Sustainability Routes
    Route::get('/sustainability', [SustainabilityController::class, 'index'])
        ->name('sustainability.index');
    Route::get('/sustainability/{jobId}', [SustainabilityController::class, 'show'])
        ->name('sustainability.show');
});

// Client Support Routes
Route::middleware(['auth'])->group(function () {
    Route::get('/support', function () {
        return Inertia::render('ClientArea/Support/Support');
    })->name('support');

    Route::get('/support/view', function () {
        return Inertia::render('ClientArea/Support/SupportView');
    })->name('support.view');
});

// Company Settings routes
Route::middleware('auth')->group(function () {
    Route::get('/settings/documents', [CompanySettingController::class, 'index'])->name('settings.documents');
    Route::post('/settings/documents', [CompanySettingController::class, 'store'])->name('settings.documents.store');
    Route::put('/settings/documents/{id}', [CompanySettingController::class, 'update'])->name('settings.documents.update');
    Route::delete('/settings/documents/{id}', [CompanySettingController::class, 'deleteDocument'])->name('settings.documents.delete');
    Route::get('/settings/documents/{id}/download', [CompanySettingController::class, 'downloadDocument'])->name('settings.documents.download');
    Route::match(['PUT', 'POST'], '/settings/documents/documents/{id}', [CompanySettingController::class, 'update'])->name('settings.documents.documents.update');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/my-collections', [ClientJobController::class, 'index']);
    Route::get('/my-collections/{id}', [ClientJobController::class, 'show'])->name('client.jobs.show');
    Route::get('/client-jobs/search', [ClientJobController::class, 'search']);
});

Route::middleware(['auth'])->group(function () {
    Route::get('/my-quotes', [ClientQuoteController::class, 'index']);
    Route::get('/my-quotes/{id}', [ClientQuoteController::class, 'show'])->name('client.quotes.show');
});


Route::post('/api/quotes/{id}/submit-request', [ClientQuoteController::class, 'submitQuoteRequest'])->name('quotes.submit-request');
Route::post('/api/quotes/{id}/mark-rejected', [ClientQuoteController::class, 'markQuoteRejected'])->name('quotes.mark-rejected');
Route::post('/api/quotes/{id}/mark-accepted', [ClientQuoteController::class, 'markQuoteAccepted'])->name('quotes.mark-accepted');
Route::get('/client-quotes/next-job-id', [ClientQuoteController::class, 'getNextJobId']);
Route::get('/my-quotes', [ClientQuoteController::class, 'index'])->name('client.quotes.index');
Route::post('/my-quotes/request-quote', [ClientQuoteController::class, 'createQuote'])->name('client.quotes.create');
Route::put('/client/quotes/{id}/update', [ClientQuoteController::class, 'updateCollectionDetails'])->name('client.quotes.update');
Route::delete('/api/quotes/{id}', [ClientQuoteController::class, 'destroy'])->name('quotes.destroy');
Route::delete('/client/quotes/{id}', [ClientQuoteController::class, 'destroy'])->name('client.quotes.destroy');
Route::put('/client/quotes/{id}/collection-details', [ClientQuoteController::class, 'updateCollectionDetails']);