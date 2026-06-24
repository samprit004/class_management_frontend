import { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
    GraduationCap, Book, Building2, Users, UserCheck, BookOpen,
    Activity, Clock, TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BACKEND_BASE_URL } from '@/constants';

// ─── Types ────────────────────────────────────────────────────────────────────

type Totals = {
    departments: number;
    subjects: number;
    classes: number;
    activeClasses: number;
    students: number;
    teachers: number;
    admins: number;
};

type ChartEntry = { name: string; value?: number; classes?: number; enrolled?: number };

type Charts = {
    classesByDepartment: { name: string; classes: number }[];
    enrollmentsByDepartment: { name: string; enrolled: number }[];
    classStatus: ChartEntry[];
    userDistribution: ChartEntry[];
    capacityStatus: ChartEntry[];
};

type RecentClass = {
    id: number;
    name: string;
    status: string;
    createdAt: string;
    subjectName: string | null;
    teacherName: string | null;
};

type RecentSubject = {
    id: number;
    name: string;
    code: string;
    createdAt: string;
    departmentName: string | null;
};

type DashboardStats = {
    totals: Totals;
    charts: Charts;
    recentActivity: { classes: RecentClass[]; subjects: RecentSubject[] };
};

// ─── Constants ─────────────────────────────────────────────────────────────────

const PIE_COLORS   = ['#f97316', '#3b82f6', '#22c55e', '#a855f7', '#ef4444', '#eab308'];
const CAP_COLORS   = ['#ef4444', '#eab308', '#22c55e'];
const STATUS_COLORS = ['#22c55e', '#94a3b8'];

// ─── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// ─── Sub-components ────────────────────────────────────────────────────────────

const StatCard = ({
    title, value, sub, icon: Icon, bg,
}: {
    title: string; value: number; sub?: string;
    icon: React.ElementType; bg: string;
}) => (
    <Card>
        <CardContent className="p-5 flex items-center justify-between gap-3">
            <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{title}</p>
                <p className="text-3xl font-bold mt-1">{value.toLocaleString()}</p>
                {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
            </div>
            <div className={`shrink-0 p-3 rounded-xl ${bg}`}>
                <Icon className="h-5 w-5 text-white" />
            </div>
        </CardContent>
    </Card>
);

const Pulse = ({ h = 'h-[260px]' }: { h?: string }) => (
    <div className={`${h} animate-pulse rounded-lg bg-muted`} />
);

const EmptyChart = ({ label }: { label: string }) => (
    <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground text-sm gap-1">
        <Activity className="h-8 w-8 opacity-30" />
        <span>No {label} yet</span>
    </div>
);

// Recharts custom tooltip wrapper
const ChartTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-lg border bg-background px-3 py-2 shadow text-xs">
            {label && <p className="font-medium mb-1">{label}</p>}
            {payload.map((p: any, i: number) => (
                <p key={i} style={{ color: p.color ?? p.fill }}>
                    {p.name}: <span className="font-semibold">{p.value}</span>
                </p>
            ))}
        </div>
    );
};

// ─── Dashboard ─────────────────────────────────────────────────────────────────

const Dashboard = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch(`${BACKEND_BASE_URL}/stats`)
            .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
            .then(d => setStats(d.data as DashboardStats))
            .catch(e => { console.error(e); setError('Could not load dashboard data.'); })
            .finally(() => setLoading(false));
    }, []);

    if (error) return (
        <div className="flex items-center justify-center h-64 text-destructive text-sm">{error}</div>
    );

    const t = stats?.totals;
    const c = stats?.charts;

    return (
        <div className="space-y-6 pb-10">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground text-sm mt-0.5">
                    Overview of your classroom management system
                </p>
            </div>

            <Separator />

            {/* ── Stat Cards ──────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
                {loading
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i}><CardContent className="p-5"><Pulse h="h-16" /></CardContent></Card>
                    ))
                    : <>
                        <StatCard title="Departments" value={t?.departments ?? 0}
                            icon={Building2} bg="bg-purple-500" />
                        <StatCard title="Subjects" value={t?.subjects ?? 0}
                            icon={Book} bg="bg-blue-500" />
                        <StatCard title="Classes" value={t?.classes ?? 0}
                            sub={`${t?.activeClasses ?? 0} active`}
                            icon={BookOpen} bg="bg-orange-500" />
                        <StatCard title="Students" value={t?.students ?? 0}
                            icon={GraduationCap} bg="bg-green-500" />
                        <StatCard title="Teachers" value={t?.teachers ?? 0}
                            icon={UserCheck} bg="bg-yellow-500" />
                        <StatCard title="Admins" value={t?.admins ?? 0}
                            icon={Users} bg="bg-red-500" />
                    </>
                }
            </div>

            {/* ── Row 1: Classes by Dept + User Distribution ──────────────────── */}
            <div className="grid lg:grid-cols-5 gap-4">

                {/* Classes by Department — bar */}
                <Card className="lg:col-span-3">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-orange-500" />
                            Classes by Department
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? <Pulse /> : (c?.classesByDepartment.length ?? 0) === 0
                            ? <EmptyChart label="department data" />
                            : (
                                <ResponsiveContainer width="100%" height={260}>
                                    <BarChart
                                        data={c?.classesByDepartment}
                                        margin={{ top: 4, right: 8, left: -20, bottom: 64 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                        <XAxis
                                            dataKey="name"
                                            tick={{ fontSize: 11 }}
                                            angle={-40}
                                            textAnchor="end"
                                            interval={0}
                                        />
                                        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                        <Tooltip content={<ChartTooltip />} />
                                        <Bar dataKey="classes" name="Classes" fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )
                        }
                    </CardContent>
                </Card>

                {/* User Distribution — donut */}
                <Card className="lg:col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-500" />
                            User Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? <Pulse /> : (c?.userDistribution.every(d => d.value === 0))
                            ? <EmptyChart label="users" />
                            : (
                                <ResponsiveContainer width="100%" height={260}>
                                    <PieChart>
                                        <Pie
                                            data={c?.userDistribution}
                                            cx="50%" cy="45%"
                                            innerRadius={60} outerRadius={95}
                                            paddingAngle={3}
                                            dataKey="value"
                                        >
                                            {c?.userDistribution.map((_, i) => (
                                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<ChartTooltip />} />
                                        <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            )
                        }
                    </CardContent>
                </Card>
            </div>

            {/* ── Row 2: Enrollments by Dept + Capacity + Class Status ─────────── */}
            <div className="grid lg:grid-cols-5 gap-4">

                {/* Enrollments by Department — bar */}
                <Card className="lg:col-span-3">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            Enrollments by Department
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? <Pulse /> : (c?.enrollmentsByDepartment.length ?? 0) === 0
                            ? <EmptyChart label="enrollment data" />
                            : (
                                <ResponsiveContainer width="100%" height={260}>
                                    <BarChart
                                        data={c?.enrollmentsByDepartment}
                                        margin={{ top: 4, right: 8, left: -20, bottom: 64 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                        <XAxis
                                            dataKey="name"
                                            tick={{ fontSize: 11 }}
                                            angle={-40}
                                            textAnchor="end"
                                            interval={0}
                                        />
                                        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                        <Tooltip content={<ChartTooltip />} />
                                        <Bar dataKey="enrolled" name="Enrolled" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )
                        }
                    </CardContent>
                </Card>

                {/* Capacity Status + Class Status stacked */}
                <div className="lg:col-span-2 flex flex-col gap-4">

                    {/* Capacity Status — donut */}
                    <Card className="flex-1">
                        <CardHeader className="pb-1">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Activity className="h-4 w-4 text-yellow-500" />
                                Capacity Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? <Pulse h="h-[140px]" /> : (c?.capacityStatus.every(d => d.value === 0))
                                ? <EmptyChart label="class data" />
                                : (
                                    <ResponsiveContainer width="100%" height={140}>
                                        <PieChart>
                                            <Pie
                                                data={c?.capacityStatus}
                                                cx="50%" cy="50%"
                                                innerRadius={38} outerRadius={58}
                                                paddingAngle={3}
                                                dataKey="value"
                                            >
                                                {c?.capacityStatus.map((_, i) => (
                                                    <Cell key={i} fill={CAP_COLORS[i % CAP_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<ChartTooltip />} />
                                            <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 11 }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )
                            }
                        </CardContent>
                    </Card>

                    {/* Class Status — donut */}
                    <Card className="flex-1">
                        <CardHeader className="pb-1">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-slate-400" />
                                Class Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? <Pulse h="h-[140px]" /> : (c?.classStatus.every(d => d.value === 0))
                                ? <EmptyChart label="class data" />
                                : (
                                    <ResponsiveContainer width="100%" height={140}>
                                        <PieChart>
                                            <Pie
                                                data={c?.classStatus}
                                                cx="50%" cy="50%"
                                                innerRadius={38} outerRadius={58}
                                                paddingAngle={3}
                                                dataKey="value"
                                            >
                                                {c?.classStatus.map((_, i) => (
                                                    <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<ChartTooltip />} />
                                            <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 11 }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )
                            }
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* ── Recent Activity ──────────────────────────────────────────────── */}
            <div className="grid lg:grid-cols-2 gap-4">

                {/* Recent Classes */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Clock className="h-4 w-4 text-orange-500" />
                            Recent Classes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading
                            ? <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Pulse key={i} h="h-11" />)}</div>
                            : !stats?.recentActivity.classes.length
                                ? <p className="text-sm text-muted-foreground text-center py-10">No classes yet</p>
                                : (
                                    <div className="space-y-1">
                                        {stats.recentActivity.classes.map((cls, i) => (
                                            <div key={cls.id}>
                                                <div className="flex items-start justify-between gap-2 py-2">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-medium truncate">{cls.name}</p>
                                                        <p className="text-xs text-muted-foreground truncate">
                                                            {cls.subjectName ?? '—'} · {cls.teacherName ?? '—'}
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col items-end shrink-0 gap-1">
                                                        <Badge
                                                            variant={cls.status === 'active' ? 'default' : 'secondary'}
                                                            className="text-[10px] px-1.5 py-0"
                                                        >
                                                            {cls.status}
                                                        </Badge>
                                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                            {fmt(cls.createdAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                                {i < stats.recentActivity.classes.length - 1 && <Separator />}
                                            </div>
                                        ))}
                                    </div>
                                )
                        }
                    </CardContent>
                </Card>

                {/* Recent Subjects */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            Recent Subjects
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading
                            ? <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Pulse key={i} h="h-11" />)}</div>
                            : !stats?.recentActivity.subjects.length
                                ? <p className="text-sm text-muted-foreground text-center py-10">No subjects yet</p>
                                : (
                                    <div className="space-y-1">
                                        {stats.recentActivity.subjects.map((sub, i) => (
                                            <div key={sub.id}>
                                                <div className="flex items-start justify-between gap-2 py-2">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-medium truncate">{sub.name}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {sub.departmentName ?? '—'}
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col items-end shrink-0 gap-1">
                                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono">
                                                            {sub.code}
                                                        </Badge>
                                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                            {fmt(sub.createdAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                                {i < stats.recentActivity.subjects.length - 1 && <Separator />}
                                            </div>
                                        ))}
                                    </div>
                                )
                        }
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
