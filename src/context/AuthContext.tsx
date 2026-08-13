import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface User {
    id: string;
    email: string;
    user_metadata?: any;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithPassword: (email: string, password: string) => Promise<{ error: any | null }>;
    signUp: (email: string, password: string) => Promise<{ error: any | null; requiresConfirmation?: boolean }>;
    signOut: () => Promise<{ error: any | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try {
                const { data } = await supabase.auth.getUser();
                const supaUser = data?.user;
                if (supaUser) {
                    setUser({
                        id: supaUser.id,
                        email: supaUser.email || '',
                        user_metadata: supaUser.user_metadata,
                    });
                }
            } finally {
                setLoading(false);
            }
        };

        initAuth();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
            const supaUser = session?.user;
            if (supaUser) {
                setUser({
                    id: supaUser.id,
                    email: supaUser.email || '',
                    user_metadata: supaUser.user_metadata,
                });
            } else {
                setUser(null);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signInWithPassword = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return { error };
        }

        const supaUser = data.user;
        if (supaUser) {
            setUser({
                id: supaUser.id,
                email: supaUser.email || '',
                user_metadata: supaUser.user_metadata,
            });
        }

        return { error: null };
    };

    const signUp = async (email: string, password: string) => {
        // Use current site URL for email confirmation redirect
        const redirectTo = typeof window !== 'undefined' ? window.location.origin : '';
        
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: redirectTo,
            },
        });

        if (error) {
            return { error };
        }

        const requiresConfirmation = !!data.user && !data.session;
        const supaUser = data.user;

        if (supaUser && data.session) {
            setUser({
                id: supaUser.id,
                email: supaUser.email || '',
                user_metadata: supaUser.user_metadata,
            });
        }

        return { error: null, requiresConfirmation };
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (!error) {
            setUser(null);
        }
        return { error: error || null };
    };

    const value = {
        user,
        loading,
        signInWithPassword,
        signUp,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
