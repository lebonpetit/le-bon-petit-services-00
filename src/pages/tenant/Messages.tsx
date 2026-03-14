import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase, Message, User, Listing } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, MessageCircle, Send, Home, User as UserIcon } from 'lucide-react';

interface Conversation {
    otherUser: User;
    listing?: Listing;
    messages: any[];
    unreadCount: number;
    lastMessage: any;
}

export default function TenantMessages() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (user) {
            fetchMessages();
        }
    }, [user]);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            console.log('Fetching messages for user:', user?.id);

            // Fetch messages where user is sender
            const { data: sentData, error: sentError } = await supabase
                .from('messages')
                .select('*')
                .eq('from_user', user?.id);

            // Fetch messages where user is receiver
            const { data: receivedData, error: receivedError } = await supabase
                .from('messages')
                .select('*')
                .eq('to_user', user?.id);

            console.log('Sent messages:', sentData?.length, sentData);
            console.log('Received messages:', receivedData?.length, receivedData);

            if (sentError) {
                console.error('Error fetching sent:', sentError);
            }
            if (receivedError) {
                console.error('Error fetching received:', receivedError);
            }

            // Combine and deduplicate
            const allMessagesMap = new Map<string, any>();
            (sentData || []).forEach(m => allMessagesMap.set(m.id, m));
            (receivedData || []).forEach(m => allMessagesMap.set(m.id, m));

            const allMessagesData = Array.from(allMessagesMap.values())
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            console.log('Total unique messages:', allMessagesData.length);

            if (allMessagesData.length === 0) {
                console.log('No messages found for user:', user?.id);
                setConversations([]);
                setLoading(false);
                return;
            }

            // Get unique user IDs from messages
            const otherUserIds = new Set<string>();
            allMessagesData.forEach(m => {
                if (m.from_user !== user?.id) otherUserIds.add(m.from_user);
                if (m.to_user !== user?.id) otherUserIds.add(m.to_user);
            });

            console.log('Other user IDs:', Array.from(otherUserIds));

            // Fetch user profiles for those IDs
            const { data: usersData } = await supabase
                .from('users')
                .select('id, name, email, phone')
                .in('id', Array.from(otherUserIds));

            console.log('Users fetched:', usersData);

            // Create a map of user profiles
            const usersMap = new Map<string, any>();
            (usersData || []).forEach(u => usersMap.set(u.id, u));

            // Get unique listing IDs
            const listingIds = new Set<string>();
            allMessagesData.forEach(m => {
                if (m.listing_id) listingIds.add(m.listing_id);
            });

            // Fetch listings
            let listingsMap = new Map<string, any>();
            if (listingIds.size > 0) {
                const { data: listingsData } = await supabase
                    .from('listings')
                    .select('*')
                    .in('id', Array.from(listingIds));

                (listingsData || []).forEach(l => listingsMap.set(l.id, l));
            }

            // Process messages into conversations
            const conversationMap = new Map<string, any>();

            allMessagesData.forEach((msg) => {
                const otherUserId = msg.from_user === user?.id ? msg.to_user : msg.from_user;

                // Create a placeholder user if profile doesn't exist
                const otherUser = usersMap.get(otherUserId) || {
                    id: otherUserId,
                    name: 'Utilisateur',
                    email: '',
                    phone: ''
                };

                const key = `${otherUserId}-${msg.listing_id || 'no-listing'}`;

                if (!conversationMap.has(key)) {
                    conversationMap.set(key, {
                        otherUser: otherUser,
                        listing: msg.listing_id ? listingsMap.get(msg.listing_id) : null,
                        messages: [],
                        unreadCount: 0,
                    });
                }

                conversationMap.get(key).messages.push({
                    ...msg,
                    sender: msg.from_user === user?.id ? user : otherUser,
                });

                if (msg.to_user === user?.id && !msg.read) {
                    conversationMap.get(key).unreadCount++;
                }
            });

            const conversationsArray: Conversation[] = Array.from(conversationMap.values())
                .map(conv => ({
                    ...conv,
                    messages: conv.messages.sort((a: any, b: any) =>
                        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                    ),
                    lastMessage: conv.messages.sort((a: any, b: any) =>
                        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                    )[0],
                }))
                .sort((a, b) =>
                    new Date(b.lastMessage?.created_at || 0).getTime() -
                    new Date(a.lastMessage?.created_at || 0).getTime()
                );

            console.log('Conversations processed:', conversationsArray.length, conversationsArray);
            setConversations(conversationsArray);
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast({
                variant: "destructive",
                title: "Erreur",
                description: "Impossible de charger les messages",
            });
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (conversation: Conversation) => {
        try {
            const unreadIds = conversation.messages
                .filter(m => m.to_user === user?.id && !m.read)
                .map(m => m.id);

            if (unreadIds.length > 0) {
                await supabase
                    .from('messages')
                    .update({ read: true })
                    .in('id', unreadIds);
            }
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    };

    const selectConversation = (conversation: Conversation) => {
        setSelectedConversation(conversation);
        markAsRead(conversation);
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation || !user) return;

        setSending(true);
        try {
            const { data, error } = await supabase
                .from('messages')
                .insert({
                    from_user: user.id,
                    to_user: selectedConversation.otherUser.id,
                    listing_id: selectedConversation.listing?.id || null,
                    content: newMessage.trim(),
                    read: false,
                })
                .select()
                .single();

            if (error) throw error;

            const updatedConversation = {
                ...selectedConversation,
                messages: [...selectedConversation.messages, { ...data, sender: user }],
                lastMessage: { ...data, sender: user },
            };

            setSelectedConversation(updatedConversation);
            setConversations(prev =>
                prev.map(c =>
                    c.otherUser.id === selectedConversation.otherUser.id &&
                        c.listing?.id === selectedConversation.listing?.id
                        ? updatedConversation
                        : c
                )
            );
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
            toast({
                variant: "destructive",
                title: "Erreur",
                description: "Impossible d'envoyer le message",
            });
        } finally {
            setSending(false);
        }
    };

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <div className="mb-6">
                    <Link to="/tenant/dashboard" className="inline-flex items-center text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour au tableau de bord
                    </Link>
                </div>

                <h1 className="font-heading text-3xl font-bold text-foreground mb-6">
                    Mes Messages
                </h1>

                <div className="grid lg:grid-cols-3 gap-6 h-[600px]">
                    <Card className="lg:col-span-1 overflow-hidden">
                        <CardHeader className="border-b">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <MessageCircle className="h-5 w-5" />
                                Conversations
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 overflow-y-auto max-h-[520px]">
                            {loading ? (
                                <div className="p-4 space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="animate-pulse flex gap-3">
                                            <div className="w-10 h-10 rounded-full bg-secondary" />
                                            <div className="flex-1">
                                                <div className="h-4 bg-secondary rounded w-1/2 mb-2" />
                                                <div className="h-3 bg-secondary rounded w-3/4" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : conversations.length === 0 ? (
                                <div className="p-8 text-center">
                                    <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">Aucun message</p>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Contactez un propriétaire via une fiche logement
                                    </p>
                                </div>
                            ) : (
                                conversations.map((conversation, index) => (
                                    <button
                                        key={index}
                                        onClick={() => selectConversation(conversation)}
                                        className={`w-full p-4 text-left border-b hover:bg-secondary/50 transition-colors ${selectedConversation?.otherUser.id === conversation.otherUser.id &&
                                            selectedConversation?.listing?.id === conversation.listing?.id
                                            ? 'bg-secondary'
                                            : ''
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-full bg-african-green/20 flex items-center justify-center">
                                                <UserIcon className="h-5 w-5 text-african-green" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="font-medium truncate">
                                                        {conversation.otherUser?.name || 'Propriétaire'}
                                                    </span>
                                                    {conversation.unreadCount > 0 && (
                                                        <Badge variant="default" className="bg-african-red">
                                                            {conversation.unreadCount}
                                                        </Badge>
                                                    )}
                                                </div>
                                                {conversation.listing && (
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Home className="h-3 w-3" />
                                                        <span className="truncate">{conversation.listing.title}</span>
                                                    </div>
                                                )}
                                                <p className="text-sm text-muted-foreground truncate mt-1">
                                                    {conversation.lastMessage?.content}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2 flex flex-col overflow-hidden">
                        {selectedConversation ? (
                            <>
                                <CardHeader className="border-b flex-shrink-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-african-green/20 flex items-center justify-center">
                                            <UserIcon className="h-5 w-5 text-african-green" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">
                                                {selectedConversation.otherUser?.name || 'Propriétaire'}
                                            </CardTitle>
                                            {selectedConversation.listing && (
                                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <Home className="h-3 w-3" />
                                                    {selectedConversation.listing.title}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {selectedConversation.messages.map((message, index) => (
                                        <div
                                            key={index}
                                            className={`flex ${message.from_user === user?.id ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[70%] rounded-2xl px-4 py-2 ${message.from_user === user?.id
                                                    ? 'bg-african-green text-white'
                                                    : 'bg-secondary'
                                                    }`}
                                            >
                                                <p className="text-sm">{message.content}</p>
                                                <p className={`text-xs mt-1 ${message.from_user === user?.id ? 'text-white/70' : 'text-muted-foreground'
                                                    }`}>
                                                    {new Date(message.created_at).toLocaleTimeString('fr-FR', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                                <div className="p-4 border-t flex-shrink-0">
                                    <div className="flex gap-2">
                                        <Textarea
                                            placeholder="Tapez votre message..."
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            className="min-h-[60px] resize-none"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    sendMessage();
                                                }
                                            }}
                                        />
                                        <Button
                                            variant="cta"
                                            size="icon"
                                            onClick={sendMessage}
                                            disabled={sending || !newMessage.trim()}
                                            className="h-[60px] w-[60px]"
                                        >
                                            <Send className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center">
                                    <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">
                                        Sélectionnez une conversation
                                    </p>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </Layout>
    );
}
