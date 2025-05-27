export interface User {
    id: number;
    name: string;
    email: string;
    type: 'Client' | 'Staff'; // Add this line
    client_details?: {
        privacy_policy: string | null;
    };
    email_verified_at?: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};
