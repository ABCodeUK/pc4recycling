import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { AuthProvider, User } from '@/contexts/AuthContext';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.tsx`, import.meta.glob('./Pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        // Type assertion for user
        const user = props.initialPage.props.auth.user as User | null;
        
        root.render(
            <AuthProvider user={user}>
                <App {...props} />
            </AuthProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
