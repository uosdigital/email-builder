declare module 'netlify-identity-widget' {
    interface User {
        id: string;
        email?: string;
        user_metadata?: any;
        app_metadata?: any;
        created_at?: string;
        confirmed_at?: string;
        token?: {
            access_token: string;
            expires_at: number;
            expires_in: number;
            refresh_token: string;
            token_type: string;
        };
    }

    interface InitOptions {
        APIUrl?: string;
        logo?: boolean;
        namePlaceholder?: string;
        locale?: string;
    }

    interface NetlifyIdentity {
        init(options?: InitOptions): void;
        open(tab?: 'login' | 'signup'): void;
        close(): void;
        currentUser(): User | null;
        logout(): void;
        on(event: 'init' | 'login' | 'logout' | 'error' | 'close', callback: (user?: User) => void): void;
        off(event: 'init' | 'login' | 'logout' | 'error' | 'close', callback?: (user?: User) => void): void;
    }

    const netlifyIdentity: NetlifyIdentity;
    export default netlifyIdentity;
}
