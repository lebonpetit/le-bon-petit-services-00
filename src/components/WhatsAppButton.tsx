import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
    phoneNumber?: string;
    message?: string;
}

export function WhatsAppButton({
    phoneNumber = '+237690000000',
    message = 'Bonjour, je souhaite réserver un appartement'
}: WhatsAppButtonProps) {
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\s/g, '')}?text=${encodeURIComponent(message)}`;

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-[#25D366] text-white font-semibold rounded-full shadow-lg hover:bg-[#128C7E] hover:shadow-xl transition-all duration-300 animate-bounce-slow group"
        >
            <MessageCircle className="h-6 w-6" />
            <span className="hidden sm:inline">Réserver maintenant</span>

            {/* Pulse effect */}
            <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-30 animate-ping" />
        </a>
    );
}
