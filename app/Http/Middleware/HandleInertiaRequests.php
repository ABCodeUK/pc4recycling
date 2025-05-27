<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\UserStaff;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     */
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => function () use ($request) {
                    if ($user = $request->user()) {
                        $user = $user->fresh();
                        
                        // Load relationships based on user type
                        if ($user->type === 'Staff') {
                            $user->load('staffDetails.role');
                        } elseif ($user->type === 'Client') {
                            $user->load('clientDetails');
                        }
                        
                        return $user->toArray();
                    }
                    return null;
                },
            ],
            'flash' => [
                'message' => fn () => $request->session()->get('message')
            ],
        ]);
    }
}
