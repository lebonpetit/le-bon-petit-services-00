import { supabase } from '@/lib/supabase';
import type { User } from '@/lib/supabase';

/**
 * Helper to build a service request insert object.
 * Automatically includes user_id if the user is logged in.
 */
export function buildServiceRequest(
    serviceType: string,
    payload: Record<string, unknown>,
    contactName: string,
    contactPhone: string,
    user?: User | null,
) {
    return {
        service_type: serviceType,
        payload,
        contact_name: contactName,
        contact_phone: contactPhone,
        status: 'new' as const,
        ...(user?.id ? { user_id: user.id } : {}),
    };
}

/**
 * Submit a service request to Supabase.
 * Automatically links the request to the logged-in user if available.
 */
export async function submitServiceRequest(
    serviceType: string,
    payload: Record<string, unknown>,
    contactName: string,
    contactPhone: string,
    user?: User | null,
) {
    const data = buildServiceRequest(serviceType, payload, contactName, contactPhone, user);
    const result = await supabase.from('requests').insert(data);
    return result;
}
