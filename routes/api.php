// Add this route to your api.php file
Route::middleware('auth:sanctum')->get('/driver-jobs', [DashboardController::class, 'getDriverJobs']);