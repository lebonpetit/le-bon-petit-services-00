import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

// Generate a random session ID if not exists
const getSessionId = () => {
    let sid = sessionStorage.getItem('analytics_session_id');
    if (!sid) {
        sid = crypto.randomUUID();
        sessionStorage.setItem('analytics_session_id', sid);
    }
    return sid;
};

export function AnalyticsTracker() {
    const location = useLocation();
    const { user } = useAuth();

    // Track presence (Realtime "Who is online")
    useEffect(() => {
        const sessionId = getSessionId();
        const channel = supabase.channel('online_users')
            .on('presence', { event: 'sync' }, () => {
                // Presence synced
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({
                        user_id: user?.id || 'anon',
                        online_at: new Date().toISOString(),
                        session_id: sessionId
                    });
                }
            });

        return () => {
            channel.unsubscribe();
        };
    }, [user]);

    // Track Page Views and Time Spent
    useEffect(() => {
        const sessionId = getSessionId();
        const path = location.pathname + location.search;
        const enteredAt = new Date();
        let viewId: string | null = null;

        // 1. Log entry
        const logEntry = async () => {
            try {
                // If we want to track real DB table history (persisted)
                // We assume there is a table 'page_views' (I will create SQL for it)
                const { data, error } = await supabase
                    .from('page_views')
                    .insert({
                        session_id: sessionId,
                        user_id: user?.id || null,
                        path: path,
                        entered_at: enteredAt.toISOString(),
                    })
                    .select()
                    .single();

                if (data) viewId = data.id;
            } catch (e) {
                // Silently fail if table doesn't exist yet
            }
        };

        logEntry();

        // 2. Log exit on unmount or change
        return () => {
            const leftAt = new Date();
            const duration = Math.round((leftAt.getTime() - enteredAt.getTime()) / 1000); // seconds

            if (viewId) {
                supabase
                    .from('page_views')
                    .update({
                        left_at: leftAt.toISOString(),
                        duration_seconds: duration
                    })
                    .eq('id', viewId)
                    .then(() => { });
            }
        };
    }, [location, user]);

    return null; // Invisible component
}
