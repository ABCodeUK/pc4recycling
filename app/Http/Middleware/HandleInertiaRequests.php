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
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? $this->getUserWithDetails($request->user()) : null,
            ],
        ];
    }

    /**
     * Get user with related details based on user type
     */
    private function getUserWithDetails($user)
    {
        if (!$user) return null;
    
        // For Staff users, load staff details with role
        if ($user->type === 'Staff') {
            // Check if staffDetails exists for this user
            $staffDetails = UserStaff::where('user_id', $user->id)->first();
            
            if ($staffDetails) {
                $user->load(['staffDetails', 'staffDetails.role']);
                
                // Debug: Add role information directly to the user object
                if ($user->staffDetails) {
                    $roleInfo = $user->staffDetails->role;
                    $user->role_debug = [
                        'role_id' => $user->staffDetails->role_id,
                        'role_name' => $roleInfo ? $roleInfo->name : null
                    ];
                }
            } else {
                // No staff details found
                $user->role_debug = [
                    'message' => 'No staff details found for this user'
                ];
            }
        }
        // For Client users, load client details
        elseif ($user->type === 'Client') {
            $user->load('clientDetails.customer_type');
        }
    
        return $user;
    }
}
