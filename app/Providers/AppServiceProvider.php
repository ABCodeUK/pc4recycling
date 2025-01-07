<?php

namespace App\Providers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Prefetch assets using Vite
        Vite::prefetch(concurrency: 3);

        // Share user data globally with Inertia
        Inertia::share([
            'user' => function () {
                if (Auth::check()) {
                    $user = Auth::user();
                    return [
                        'name' => $user->name,
                        'email' => $user->email,
                        'avatar' => $user->avatar ?? '/default-avatar.png', // Default avatar if not set
                    ];
                }
                return null; // Return null if the user is not authenticated
            },
        ]);
    }
}
