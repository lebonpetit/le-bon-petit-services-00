import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface PhoneInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    value: string;
    onValueChange: (value: string) => void;
    defaultCountryCode?: string;
}

const COUNTRY_CODES = [
    // Afrique Centrale
    { code: '+237', country: 'CM', label: 'Cameroun (+237)' },
    { code: '+241', country: 'GA', label: 'Gabon (+241)' },
    { code: '+242', country: 'CG', label: 'Congo-Brazzaville (+242)' },
    { code: '+243', country: 'CD', label: 'RDC (+243)' },
    { code: '+235', country: 'TD', label: 'Tchad (+235)' },
    { code: '+236', country: 'CF', label: 'RCA (+236)' },
    { code: '+240', country: 'GQ', label: 'Guinée Équatoriale (+240)' },

    // Afrique de l'Ouest
    { code: '+225', country: 'CI', label: 'Côte d\'Ivoire (+225)' },
    { code: '+221', country: 'SN', label: 'Sénégal (+221)' },
    { code: '+223', country: 'ML', label: 'Mali (+223)' },
    { code: '+226', country: 'BF', label: 'Burkina Faso (+226)' },
    { code: '+228', country: 'TG', label: 'Togo (+228)' },
    { code: '+229', country: 'BJ', label: 'Bénin (+229)' },
    { code: '+227', country: 'NE', label: 'Niger (+227)' },
    { code: '+234', country: 'NG', label: 'Nigeria (+234)' },
    { code: '+233', country: 'GH', label: 'Ghana (+233)' },
    { code: '+224', country: 'GN', label: 'Guinée (+224)' },

    // Autres Afrique
    { code: '+212', country: 'MA', label: 'Maroc (+212)' },
    { code: '+216', country: 'TN', label: 'Tunisie (+216)' },
    { code: '+213', country: 'DZ', label: 'Algérie (+213)' },
    { code: '+27', country: 'ZA', label: 'Afrique du Sud (+27)' },
    { code: '+254', country: 'KE', label: 'Kenya (+254)' },
    { code: '+250', country: 'RW', label: 'Rwanda (+250)' },

    // Europe
    { code: '+33', country: 'FR', label: 'France (+33)' },
    { code: '+32', country: 'BE', label: 'Belgique (+32)' },
    { code: '+41', country: 'CH', label: 'Suisse (+41)' },
    { code: '+49', country: 'DE', label: 'Allemagne (+49)' },
    { code: '+44', country: 'GB', label: 'Royaume-Uni (+44)' },
    { code: '+34', country: 'ES', label: 'Espagne (+34)' },
    { code: '+39', country: 'IT', label: 'Italie (+39)' },

    // Amériques
    { code: '+1', country: 'US', label: 'États-Unis/Canada (+1)' },
    { code: '+55', country: 'BR', label: 'Brésil (+55)' },

    // Asie & Moyen-Orient
    { code: '+971', country: 'AE', label: 'Émirats (UAE) (+971)' },
    { code: '+86', country: 'CN', label: 'Chine (+86)' },
    { code: '+90', country: 'TR', label: 'Turquie (+90)' },
    { code: '+91', country: 'IN', label: 'Inde (+91)' },
];

export function PhoneInputV2({ value, onValueChange, className, defaultCountryCode = '+237', ...props }: PhoneInputProps) {
    // Extract country code and number from the full value if possible
    // Assumption: value might be fully formatted like "+237 690909090" or just "690909090"

    const [countryCode, setCountryCode] = useState(defaultCountryCode);
    const [phoneNumber, setPhoneNumber] = useState('');

    // Sync internal state with external value on mount or when value changes externally
    useEffect(() => {
        if (!value) {
            setPhoneNumber('');
            return;
        }

        // Check if value starts with one of our known codes
        const knownCode = COUNTRY_CODES.find(c => value.startsWith(c.code));
        if (knownCode) {
            setCountryCode(knownCode.code);
            setPhoneNumber(value.slice(knownCode.code.length).trim());
        } else {
            // If no code found, assume it belongs to current countryCode or is raw
            // But if it's the first load and we have a default, we might just keep the number
            setPhoneNumber(value);
        }
    }, [value]); // Be careful with loops here, but since we split, it should be fine if logic is stable

    const handleCodeChange = (newCode: string) => {
        setCountryCode(newCode);
        // Reconstruct full value
        onValueChange(`${newCode} ${phoneNumber}`);
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Allow spaces and digits
        const raw = e.target.value.replace(/[^0-9\s]/g, '');
        setPhoneNumber(raw);
        onValueChange(`${countryCode} ${raw}`);
    };

    return (
        <div className={`flex gap-2 ${className}`}>
            <Select value={countryCode} onValueChange={handleCodeChange}>
                <SelectTrigger className="w-[140px] shrink-0 bg-background/50 border-african-yellow/50">
                    <SelectValue placeholder="Code" />
                </SelectTrigger>
                <SelectContent>
                    {COUNTRY_CODES.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                            <span className="flex items-center gap-2">
                                <span className="text-muted-foreground text-xs">{c.country}</span>
                                <span>{c.code}</span>
                            </span>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Input
                type="tel"
                inputMode="numeric"
                value={phoneNumber}
                onChange={handleNumberChange}
                className="flex-1 bg-background/50 border-african-yellow/50 focus:border-african-yellow"
                placeholder="6XX XXX XXX"
                {...props}
            />
        </div>
    );
}
