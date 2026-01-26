import { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ServiceRequest, User, Listing, supabase } from '@/lib/supabase';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { TrendingUp, Clock, MapPin, Users, Package } from 'lucide-react';

interface AnalyticsTabProps {
    requests: ServiceRequest[];
    tenants: User[];
    landlords: User[];
    listings: Listing[];
}

const COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

const serviceLabels: Record<string, string> = {
    colis: 'Colis',
    gaz: 'Gaz',
    lessive: 'Lessive',
    poubelles: 'Poubelles',
    nettoyage: 'Nettoyage',
    logement: 'Logement',
    demenagement: 'Déménagement',
};

export function AnalyticsTab({ requests, tenants, landlords, listings }: AnalyticsTabProps) {
    // Requests per day (last 30 days)
    const requestsPerDay = useMemo(() => {
        const today = new Date();
        const days: Record<string, number> = {};

        // Initialize last 14 days
        for (let i = 13; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const key = date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
            days[key] = 0;
        }

        // Count requests
        requests.forEach(r => {
            const date = new Date(r.created_at);
            const key = date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
            if (days[key] !== undefined) {
                days[key]++;
            }
        });

        return Object.entries(days).map(([date, count]) => ({ date, demandes: count }));
    }, [requests]);

    // Service distribution
    const serviceDistribution = useMemo(() => {
        const counts: Record<string, number> = {};
        requests.forEach(r => {
            counts[r.service_type] = (counts[r.service_type] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({
            name: serviceLabels[name] || name,
            value,
        }));
    }, [requests]);

    // Hourly activity (peak hours)
    const hourlyActivity = useMemo(() => {
        const hours: Record<number, number> = {};
        for (let i = 0; i < 24; i++) hours[i] = 0;

        requests.forEach(r => {
            const hour = new Date(r.created_at).getHours();
            hours[hour]++;
        });

        return Object.entries(hours).map(([hour, count]) => ({
            heure: `${hour}h`,
            demandes: count,
        }));
    }, [requests]);

    // Top quartiers from listings
    const topQuartiers = useMemo(() => {
        const counts: Record<string, number> = {};
        listings.forEach(l => {
            if (l.quartier) {
                counts[l.quartier] = (counts[l.quartier] || 0) + 1;
            }
        });
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([quartier, count]) => ({ quartier, logements: count }));
    }, [listings]);

    // User distribution
    const userDistribution = useMemo(() => [
        { name: 'Locataires', value: tenants.length },
        { name: 'Bailleurs', value: landlords.length },
    ], [tenants, landlords]);

    // Status distribution
    const statusDistribution = useMemo(() => {
        const newCount = requests.filter(r => r.status === 'new').length;
        const processedCount = requests.filter(r => r.status === 'processed').length;
        const cancelledCount = requests.filter(r => r.status === 'cancelled').length;
        return [
            { name: 'Nouvelles', value: newCount },
            { name: 'Traitées', value: processedCount },
            { name: 'Annulées', value: cancelledCount },
        ];
    }, [requests]);

    // ... previous code

    // Real-time Online Users
    const [onlineUsers, setOnlineUsers] = useState(0);
    const { data: pageViews = [] } = useQuery({
        queryKey: ['page_views'],
        queryFn: async () => {
            const { data } = await supabase
                .from('page_views')
                .select('*, users(email, name)')
                .order('entered_at', { ascending: false })
                .limit(50);
            return data || [];
        },
        refetchInterval: 10000, // Refresh every 10s
    });

    useEffect(() => {
        const channel = supabase.channel('online_users')
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();
                setOnlineUsers(Object.keys(state).length);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <div className="space-y-6">
            {/* Real-time Status Banner */}
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-1 shadow-lg animate-fade-in">
                <div className="bg-background rounded-[1.3rem] p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                            <div className="p-3 bg-secondary rounded-full">
                                <Users className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                        <div>
                            <h3 className="font-heading font-bold text-xl">Utilisateurs en ligne</h3>
                            <p className="text-muted-foreground text-sm">Actuellement connectés sur le site</p>
                        </div>
                    </div>
                    <div className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                        {onlineUsers}
                    </div>
                </div>
            </div>

            {/* Recent Activity Log */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5" /> Historique de navigation
                    </CardTitle>
                    <CardDescription>Les 50 dernières pages consultées et le temps passé.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-secondary/50 text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">Utilisateur</th>
                                    <th className="px-4 py-3">Page</th>
                                    <th className="px-4 py-3">Entrée</th>
                                    <th className="px-4 py-3 rounded-r-lg">Durée</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {pageViews.map((view: any) => (
                                    <tr key={view.id} className="hover:bg-secondary/10">
                                        <td className="px-4 py-3 font-medium">
                                            {view.users?.email || 'Visiteur Anonyme'}
                                        </td>
                                        <td className="px-4 py-3 truncate max-w-[200px]" title={view.path}>
                                            {view.path}
                                        </td>
                                        <td className="px-4 py-3">
                                            {new Date(view.entered_at).toLocaleTimeString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            {view.duration_seconds ? `${view.duration_seconds}s` : 'En cours...'}
                                        </td>
                                    </tr>
                                ))}
                                {pageViews.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                                            Aucune donnée d'activité récente.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-african-green/20 flex items-center justify-center">
                                <Package className="h-5 w-5 text-african-green" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Total Demandes</p>
                                <p className="font-heading text-2xl font-bold">{requests.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                                <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Utilisateurs</p>
                                <p className="font-heading text-2xl font-bold">{tenants.length + landlords.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-african-yellow/20 flex items-center justify-center">
                                <MapPin className="h-5 w-5 text-african-yellow" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Logements</p>
                                <p className="font-heading text-2xl font-bold">{listings.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                                <TrendingUp className="h-5 w-5 text-cyan-500" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Taux traitement</p>
                                <p className="font-heading text-2xl font-bold">
                                    {requests.length > 0
                                        ? Math.round((requests.filter(r => r.status === 'processed').length / requests.length) * 100)
                                        : 0}%
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Requests Trend */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <TrendingUp className="h-4 w-4" />
                            Évolution des demandes (14 jours)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={requestsPerDay}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey="demandes"
                                    stroke="#22c55e"
                                    strokeWidth={2}
                                    dot={{ fill: '#22c55e', r: 3 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Hourly Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Clock className="h-4 w-4" />
                            Heures d'activité
                        </CardTitle>
                        <CardDescription>Demandes par heure de la journée</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={hourlyActivity}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis dataKey="heure" tick={{ fontSize: 10 }} interval={2} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Bar dataKey="demandes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid md:grid-cols-3 gap-6">
                {/* Service Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Package className="h-4 w-4" />
                            Services demandés
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={serviceDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={70}
                                    paddingAngle={2}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={false}
                                >
                                    {serviceDistribution.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* User Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Users className="h-4 w-4" />
                            Répartition utilisateurs
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={userDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ name, value }) => `${name}: ${value}`}
                                    labelLine={false}
                                >
                                    <Cell fill="#22c55e" />
                                    <Cell fill="#3b82f6" />
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Status Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <TrendingUp className="h-4 w-4" />
                            Statut des demandes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={statusDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ name, value }) => `${name}: ${value}`}
                                    labelLine={false}
                                >
                                    <Cell fill="#ef4444" />
                                    <Cell fill="#22c55e" />
                                    <Cell fill="#9ca3af" />
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Top Locations */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <MapPin className="h-4 w-4" />
                        Top Quartiers (Logements)
                    </CardTitle>
                    <CardDescription>Les quartiers avec le plus de logements publiés</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={topQuartiers} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                            <YAxis dataKey="quartier" type="category" tick={{ fontSize: 11 }} width={100} />
                            <Tooltip />
                            <Bar dataKey="logements" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
