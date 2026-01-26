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
    { code: '+237', country: 'CM', label: 'Cameroun (+237)' },
    { code: '+33', country: 'FR', label: 'France (+33)' },
    { code: '+1', country: 'US', label: 'USA (+1)' },
    { code: '+241', country: 'GA', label: 'Gabon (+241)' },
    { code: '+242', country: 'CG', label: 'Congo (+242)' },
    { code: '+235', country: 'TD', label: 'Tchad (+235)' },
    { code: '+236', country: 'CF', label: 'RCA (+236)' },
];

export function PhoneInput({ value, onValueChange, className, defaultCountryCode = '+237', ...props }: PhoneInputProps) {
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
                <SelectTrigger className="w-[140px] shrink-0 bg-background/50">
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
                className="flex-1 bg-background/50"
                placeholder="6XX XXX XXX"
                {...props}
            />
        </div>
    );
}
