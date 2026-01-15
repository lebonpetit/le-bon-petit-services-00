import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, User, UserRole } from '@/lib/supabase';
import { Session, AuthError } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signUp: (email: string, password: string, name: string, phone: string, role: UserRole) => Promise<{ error: AuthError | null }>;
    signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
    signOut: () => Promise<void>;
    updateProfile: (updates: Partial<User>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        // Function to handle session updates
        const handleSession = async (session: Session | null) => {
            if (!mounted) return;

            setSession(session);

            if (session?.user) {
                // If we have a user, ensure we show loading while fetching profile
                setLoading(true);
                await fetchUserProfile(session.user.id);
            } else {
                // No user, clear everything
                setUser(null);
                setLoading(false);
            }
        };

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            handleSession(session); // Just delegate to common handler
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            handleSession(session);
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const fetchUserProfile = async (userId: string) => {
        try {
            console.log('Fetching profile for user:', userId);
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Profile fetch error:', error);

                // If no profile exists (406 error), try to create one
                if (error.code === 'PGRST116') {
                    console.log('Profile not found, creating default profile...');

                    // Get user info from session including metadata
                    const { data: { session } } = await supabase.auth.getSession();
                    const email = session?.user?.email || '';
                    const userMetadata = session?.user?.user_metadata || {};

                    // Get role from metadata (set during signup) or default to landlord
                    const intendedRole = userMetadata.role || 'landlord';
                    const userName = userMetadata.name || email.split('@')[0] || 'Utilisateur';
                    const userPhone = userMetadata.phone || '';

                    // Tenants start with pending status (need payment approval)
                    const userStatus = intendedRole === 'tenant' ? 'pending' : 'active';

                    // Create profile with correct role
                    const { data: newProfile, error: insertError } = await supabase
                        .from('users')
                        .insert({
                            id: userId,
                            email: email,
                            name: userName,
                            phone: userPhone,
                            role: intendedRole,
                            status: userStatus,
                        })
                        .select()
                        .single();

                    if (insertError) {
                        console.error('Error creating profile:', insertError);
                        throw insertError;
                    }

                    console.log('Profile created with role:', intendedRole);
                    setUser(newProfile as User);
                    return;
                }

                throw error;
            }
            console.log('Profile fetched:', data);
            setUser(data as User);
        } catch (error) {
            console.error('Error fetching user profile:', error);
            // Don't fully logout on error, but maybe keep retrying? 
            // For now, just set user to null to force re-login if critical failure
            // But if it's network, maybe we should be more lenient?
            // Safer to clear for now to avoid inconsistent state
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const signUp = async (email: string, password: string, name: string, phone: string, role: UserRole) => {
        // Store role and user info in metadata so it persists through email confirmation
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                    phone,
                    role,
                }
            }
        });

        if (error) return { error };

        if (data.user) {
            // Create user profile
            const { error: profileError } = await supabase.from('users').insert({
                id: data.user.id,
                email,
                phone,
                name,
                role,
                status: role === 'tenant' ? 'pending' : 'active', // Tenants need payment validation
            });

            if (profileError) {
                console.error('Error creating user profile:', profileError);
                // Profile might already exist, that's OK
            }

            // If tenant, create pending subscription
            if (role === 'tenant') {
                const startDate = new Date();
                const endDate = new Date();
                endDate.setMonth(endDate.getMonth() + 1);

                await supabase.from('subscriptions').insert({
                    user_id: data.user.id,
                    start_date: startDate.toISOString().split('T')[0],
                    end_date: endDate.toISOString().split('T')[0],
                    status: 'pending',
                });
            }
        }

        return { error: null };
    };

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        return { error };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
    };

    const updateProfile = async (updates: Partial<User>) => {
        if (!user) return { error: new Error('No user logged in') };

        const { error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', user.id);

        if (!error) {
            setUser({ ...user, ...updates });
        }

        return { error };
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
