<?php

namespace App\Providers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

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
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'type' => $user->type,
                        'avatar' => $user->avatar ?? '/default-avatar.png',
                        'clientDetails' => $user->type === 'Client' ? $user->clientDetails : null,
                    ];
                }
                return null;
            },
        ]);
    }
}
