import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

interface PlatformSettings {
    company_name: string;
    contact_phone: string;
    contact_email: string;
    whatsapp: string;
    address: string;
}

interface ServicesSettings {
    [key: string]: boolean;
}

interface SettingsContextType {
    platform: PlatformSettings;
    services: ServicesSettings;
    loading: boolean;
}

const defaultPlatformSettings: PlatformSettings = {
    company_name: 'Le Bon Petit',
    contact_phone: '+237 6XX XXX XXX',
    contact_email: 'contact@lebonpetit237.com',
    whatsapp: '+237 6XX XXX XXX',
    address: 'Douala, Cameroun',
};

const defaultServicesSettings: ServicesSettings = {
    colis: true,
    gaz: true,
    lessive: true,
    poubelles: true,
    nettoyage: true,
};

const SettingsContext = createContext<SettingsContextType>({
    platform: defaultPlatformSettings,
    services: defaultServicesSettings,
    loading: true,
});

export function useSettings() {
    return useContext(SettingsContext);
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [platform, setPlatform] = useState<PlatformSettings>(defaultPlatformSettings);
    const [services, setServices] = useState<ServicesSettings>(defaultServicesSettings);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettings();

        // Subscribe to changes
        const subscription = supabase
            .channel('public:settings')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, (payload) => {
                console.log('Settings changed!', payload);
                fetchSettings();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('settings')
                .select('*');

            if (error) {
                console.error('Error fetching settings:', error);
                return;
            }

            if (data) {
                data.forEach(setting => {
                    if (setting.key === 'platform' && setting.value) {
                        setPlatform(prev => ({ ...prev, ...setting.value }));
                    }
                    if (setting.key === 'services' && setting.value) {
                        setServices(prev => ({ ...prev, ...setting.value }));
                    }
                });
            }
        } catch (error) {
            console.error('Unexpected error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SettingsContext.Provider value={{ platform, services, loading }}>
            {children}
        </SettingsContext.Provider>
    );
}
