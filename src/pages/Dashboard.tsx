import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
    GraduationCap, Book, Building2, Users, UserCheck, BookOpen,
    Activity, Clock, TrendingUp, School, CalendarDays, CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { BACKEND_BASE_URL } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';

// ─── Shared helpers ────────────────────────────────────────────────────────────

const PIE_COLORS    = ['#22c55e', '#94a3b8'];
const PIE_COLORS2   = ['#f97316', '#3b82f6', '#22c55e', '#a855f7'];
const CAP_COLORS    = ['#ef4444', '#eab308', '#22c55e'];

const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const Pulse = ({ h = 'h-[260px]' }: { h?: string }) => (
    <div className={`${h} animate-pulse rounded-lg bg-muted`} />
);

const EmptyChart = ({ label }: { label: string }) => (
    <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground text-sm gap-1">
        <Activity className="h-8 w-8 opacity-30" />
        <span>No {label} yet</span>
    </div>
);

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

const StatCard = ({
    title, value, sub, icon: Icon, bg,
}: {
    title: string; value: number | string; sub?: string;
    icon: React.ElementType; bg: string;
}) => (
    <Card>
        <CardContent className="p-5 flex items-center justify-between gap-3">
            <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{title}</p>
                <p className="text-3xl font-bold mt-1">{typeof value === 'number' ? value.toLocaleString() : value}</p>
                {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
            </div>
            <div className={`shrink-0 p-3 rounded-xl ${bg}`}>
                <Icon className="h-5 w-5 text-white" />
            </div>
        </CardContent>
    </Card>
);

// ─── Admin Dashboard ───────────────────────────────────────────────────────────

type AdminStats = {
    totals: { departments: number; subjects: number; classes: number; activeClasses: number; students: number; teachers: number; admins: number };
    charts: {
        classesByDepartment: { name: string; classes: number }[];
        enrollmentsByDepartment: { name: string; enrolled: number }[];
        classStatus: { name: string; value: number }[];
        userDistribution: { name: string; value: number }[];
        capacityStatus: { name: string; value: number }[];
    };
    recentActivity: {
        classes: { id: number; name: string; status: string; createdAt: string; subjectName: string | null; teacherName: string | null }[];
        subjects: { id: number; name: string; code: string; createdAt: string; departmentName: string | null }[];
    };
};

function AdminDashboard() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch(`${BACKEND_BASE_URL}/stats`)
            .then(r => { if (!r.ok) throw new Error(); return r.json(); })
            .then(d => setStats(d.data))
            .catch(() => setError('Could not load dashboard data.'))
            .finally(() => setLoading(false));
    }, []);

    if (error) return <div className="flex items-center justify-center h-64 text-destructive text-sm">{error}</div>;

    const t = stats?.totals;
    const c = stats?.charts;

    return (
        <div className="space-y-6 pb-10">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground text-sm mt-0.5">Overview of your classroom management system</p>
            </div>
            <Separator />

            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
                {loading
                    ? Array.from({ length: 6 }).map((_, i) => <Card key={i}><CardContent className="p-5"><Pulse h="h-16" /></CardContent></Card>)
                    : <>
                        <StatCard title="Departments" value={t?.departments ?? 0} icon={Building2} bg="bg-purple-500" />
                        <StatCard title="Subjects" value={t?.subjects ?? 0} icon={Book} bg="bg-blue-500" />
                        <StatCard title="Classes" value={t?.classes ?? 0} sub={`${t?.activeClasses ?? 0} active`} icon={BookOpen} bg="bg-orange-500" />
                        <StatCard title="Students" value={t?.students ?? 0} icon={GraduationCap} bg="bg-green-500" />
                        <StatCard title="Teachers" value={t?.teachers ?? 0} icon={UserCheck} bg="bg-yellow-500" />
                        <StatCard title="Admins" value={t?.admins ?? 0} icon={Users} bg="bg-red-500" />
                    </>
                }
            </div>

            <div className="grid lg:grid-cols-5 gap-4">
                <Card className="lg:col-span-3">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-orange-500" /> Classes by Department
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? <Pulse /> : (c?.classesByDepartment.length ?? 0) === 0 ? <EmptyChart label="department data" /> : (
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={c?.classesByDepartment} margin={{ top: 4, right: 8, left: -20, bottom: 64 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-40} textAnchor="end" interval={0} />
                                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Bar dataKey="classes" name="Classes" fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-500" /> User Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? <Pulse /> : c?.userDistribution.every(d => d.value === 0) ? <EmptyChart label="users" /> : (
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie data={c?.userDistribution} cx="50%" cy="45%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value">
                                        {c?.userDistribution.map((_, i) => <Cell key={i} fill={PIE_COLORS2[i % PIE_COLORS2.length]} />)}
                                    </Pie>
                                    <Tooltip content={<ChartTooltip />} />
                                    <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-5 gap-4">
                <Card className="lg:col-span-3">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-500" /> Enrollments by Department
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? <Pulse /> : (c?.enrollmentsByDepartment.length ?? 0) === 0 ? <EmptyChart label="enrollment data" /> : (
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={c?.enrollmentsByDepartment} margin={{ top: 4, right: 8, left: -20, bottom: 64 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-40} textAnchor="end" interval={0} />
                                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Bar dataKey="enrolled" name="Enrolled" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <Card className="flex-1">
                        <CardHeader className="pb-1">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Activity className="h-4 w-4 text-yellow-500" /> Capacity Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? <Pulse h="h-[140px]" /> : c?.capacityStatus.every(d => d.value === 0) ? <EmptyChart label="class data" /> : (
                                <ResponsiveContainer width="100%" height={140}>
                                    <PieChart>
                                        <Pie data={c?.capacityStatus} cx="50%" cy="50%" innerRadius={38} outerRadius={58} paddingAngle={3} dataKey="value">
                                            {c?.capacityStatus.map((_, i) => <Cell key={i} fill={CAP_COLORS[i % CAP_COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip content={<ChartTooltip />} />
                                        <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 11 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                    <Card className="flex-1">
                        <CardHeader className="pb-1">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-slate-400" /> Class Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? <Pulse h="h-[140px]" /> : c?.classStatus.every(d => d.value === 0) ? <EmptyChart label="class data" /> : (
                                <ResponsiveContainer width="100%" height={140}>
                                    <PieChart>
                                        <Pie data={c?.classStatus} cx="50%" cy="50%" innerRadius={38} outerRadius={58} paddingAngle={3} dataKey="value">
                                            {c?.classStatus.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip content={<ChartTooltip />} />
                                        <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 11 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Clock className="h-4 w-4 text-orange-500" /> Recent Classes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading
                            ? <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Pulse key={i} h="h-11" />)}</div>
                            : !stats?.recentActivity.classes.length
                                ? <p className="text-sm text-muted-foreground text-center py-10">No classes yet</p>
                                : <div className="space-y-1">{stats.recentActivity.classes.map((cls, i) => (
                                    <div key={cls.id}>
                                        <div className="flex items-start justify-between gap-2 py-2">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium truncate">{cls.name}</p>
                                                <p className="text-xs text-muted-foreground truncate">{cls.subjectName ?? '—'} · {cls.teacherName ?? '—'}</p>
                                            </div>
                                            <div className="flex flex-col items-end shrink-0 gap-1">
                                                <Badge variant={cls.status === 'active' ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">{cls.status}</Badge>
                                                <span className="text-[10px] text-muted-foreground">{fmt(cls.createdAt)}</span>
                                            </div>
                                        </div>
                                        {i < stats.recentActivity.classes.length - 1 && <Separator />}
                                    </div>
                                ))}</div>
                        }
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500" /> Recent Subjects
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading
                            ? <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Pulse key={i} h="h-11" />)}</div>
                            : !stats?.recentActivity.subjects.length
                                ? <p className="text-sm text-muted-foreground text-center py-10">No subjects yet</p>
                                : <div className="space-y-1">{stats.recentActivity.subjects.map((sub, i) => (
                                    <div key={sub.id}>
                                        <div className="flex items-start justify-between gap-2 py-2">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium truncate">{sub.name}</p>
                                                <p className="text-xs text-muted-foreground">{sub.departmentName ?? '—'}</p>
                                            </div>
                                            <div className="flex flex-col items-end shrink-0 gap-1">
                                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono">{sub.code}</Badge>
                                                <span className="text-[10px] text-muted-foreground">{fmt(sub.createdAt)}</span>
                                            </div>
                                        </div>
                                        {i < stats.recentActivity.subjects.length - 1 && <Separator />}
                                    </div>
                                ))}</div>
                        }
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// ─── Teacher Dashboard ─────────────────────────────────────────────────────────

type TeacherStats = {
    totals: { classes: number; activeClasses: number; students: number; subjects: number };
    charts: {
        enrollmentPerClass: { name: string; enrolled: number; capacity: number }[];
        classStatus: { name: string; value: number }[];
    };
    recentClasses: { id: number; name: string; status: string; capacity: number; createdAt: string; subjectName: string | null; enrolled: number }[];
};

function TeacherDashboard({ name }: { name: string }) {
    const [stats, setStats] = useState<TeacherStats | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`${BACKEND_BASE_URL}/stats/teacher`, { credentials: 'include' })
            .then(r => r.json()).then(d => setStats(d.data)).catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const t = stats?.totals;
    const c = stats?.charts;

    return (
        <div className="space-y-6 pb-10">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Welcome back, {name.split(' ')[0]}!</h1>
                <p className="text-muted-foreground text-sm mt-0.5">Here's an overview of your classes</p>
            </div>
            <Separator />

            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {loading
                    ? Array.from({ length: 4 }).map((_, i) => <Card key={i}><CardContent className="p-5"><Pulse h="h-16" /></CardContent></Card>)
                    : <>
                        <StatCard title="My Classes" value={t?.classes ?? 0} sub={`${t?.activeClasses ?? 0} active`} icon={BookOpen} bg="bg-orange-500" />
                        <StatCard title="Total Students" value={t?.students ?? 0} sub="across all classes" icon={GraduationCap} bg="bg-green-500" />
                        <StatCard title="Active Classes" value={t?.activeClasses ?? 0} icon={CheckCircle2} bg="bg-blue-500" />
                        <StatCard title="Subjects Covered" value={t?.subjects ?? 0} icon={Book} bg="bg-purple-500" />
                    </>
                }
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-5 gap-4">
                <Card className="lg:col-span-3">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Users className="h-4 w-4 text-green-500" /> Students per Class
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? <Pulse /> : (c?.enrollmentPerClass.length ?? 0) === 0
                            ? <EmptyChart label="class data" />
                            : (
                                <ResponsiveContainer width="100%" height={260}>
                                    <BarChart data={c?.enrollmentPerClass} margin={{ top: 4, right: 8, left: -20, bottom: 64 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                        <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" interval={0} />
                                        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                        <Tooltip content={<ChartTooltip />} />
                                        <Bar dataKey="enrolled" name="Enrolled" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                        <Bar dataKey="capacity" name="Capacity" fill="#e2e8f0" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )
                        }
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Activity className="h-4 w-4 text-orange-500" /> Class Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? <Pulse /> : c?.classStatus.every(d => d.value === 0)
                            ? <EmptyChart label="classes" />
                            : (
                                <ResponsiveContainer width="100%" height={260}>
                                    <PieChart>
                                        <Pie data={c?.classStatus} cx="50%" cy="45%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value">
                                            {c?.classStatus.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
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

            {/* My classes list */}
            <Card>
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Clock className="h-4 w-4 text-orange-500" /> My Recent Classes
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={() => navigate('/classes')}>View All</Button>
                </CardHeader>
                <CardContent>
                    {loading
                        ? <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Pulse key={i} h="h-12" />)}</div>
                        : !stats?.recentClasses.length
                            ? (
                                <div className="text-center py-10 space-y-3">
                                    <p className="text-sm text-muted-foreground">You haven't created any classes yet.</p>
                                    <Button size="sm" onClick={() => navigate('/classes/create')}>Create your first class</Button>
                                </div>
                            )
                            : (
                                <div className="space-y-1">
                                    {stats.recentClasses.map((cls, i) => (
                                        <div key={cls.id}>
                                            <div
                                                className="flex items-center justify-between gap-2 py-2.5 cursor-pointer hover:bg-muted/40 rounded-lg px-2 -mx-2 transition-colors"
                                                onClick={() => navigate(`/classes/show/${cls.id}`)}
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium truncate">{cls.name}</p>
                                                    <p className="text-xs text-muted-foreground">{cls.subjectName ?? '—'}</p>
                                                </div>
                                                <div className="flex items-center gap-3 shrink-0">
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Users className="h-3 w-3" />
                                                        {Number(cls.enrolled)} / {Number(cls.capacity)}
                                                    </span>
                                                    <Badge variant={cls.status === 'active' ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">
                                                        {cls.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                            {i < stats.recentClasses.length - 1 && <Separator />}
                                        </div>
                                    ))}
                                </div>
                            )
                    }
                </CardContent>
            </Card>
        </div>
    );
}

// ─── Student Dashboard ─────────────────────────────────────────────────────────

type StudentStats = {
    totals: { enrolled: number; activeEnrolled: number; availableClasses: number; teachers: number };
    charts: {
        enrollmentStatus: { name: string; value: number }[];
        classCapacity: { name: string; enrolled: number; capacity: number }[];
    };
    enrolledClasses: {
        id: number; name: string; status: string; capacity: number;
        schedules: { day: string; startTime: string; endTime: string }[] | null;
        subjectName: string | null; teacherName: string | null;
        enrolledCount: number;
    }[];
};

const DAY_SHORT: Record<string, string> = {
    Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu',
    Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun',
};

function StudentDashboard({ name }: { name: string }) {
    const [stats, setStats] = useState<StudentStats | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`${BACKEND_BASE_URL}/stats/student`, { credentials: 'include' })
            .then(r => r.json()).then(d => setStats(d.data)).catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const t = stats?.totals;
    const c = stats?.charts;

    return (
        <div className="space-y-6 pb-10">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Welcome back, {name.split(' ')[0]}!</h1>
                <p className="text-muted-foreground text-sm mt-0.5">Here's your learning overview</p>
            </div>
            <Separator />

            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {loading
                    ? Array.from({ length: 4 }).map((_, i) => <Card key={i}><CardContent className="p-5"><Pulse h="h-16" /></CardContent></Card>)
                    : <>
                        <StatCard title="Enrolled Classes" value={t?.enrolled ?? 0} sub={`${t?.activeEnrolled ?? 0} active`} icon={BookOpen} bg="bg-blue-500" />
                        <StatCard title="Active Classes" value={t?.activeEnrolled ?? 0} icon={CheckCircle2} bg="bg-green-500" />
                        <StatCard title="Available Classes" value={t?.availableClasses ?? 0} sub="you can join" icon={GraduationCap} bg="bg-orange-500" />
                        <StatCard title="My Teachers" value={t?.teachers ?? 0} icon={School} bg="bg-purple-500" />
                    </>
                }
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-5 gap-4">
                <Card className="lg:col-span-3">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-blue-500" /> Class Capacity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? <Pulse /> : (c?.classCapacity.length ?? 0) === 0
                            ? (
                                <div className="flex flex-col items-center justify-center h-[200px] gap-3 text-muted-foreground">
                                    <GraduationCap className="h-10 w-10 opacity-20" />
                                    <p className="text-sm">Join a class to see it here</p>
                                    <Button size="sm" variant="outline" onClick={() => navigate('/enrollments')}>Browse Classes</Button>
                                </div>
                            )
                            : (
                                <ResponsiveContainer width="100%" height={260}>
                                    <BarChart data={c?.classCapacity} margin={{ top: 4, right: 8, left: -20, bottom: 64 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                        <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" interval={0} />
                                        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                        <Tooltip content={<ChartTooltip />} />
                                        <Bar dataKey="enrolled" name="Enrolled" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                        <Bar dataKey="capacity" name="Capacity" fill="#e2e8f0" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )
                        }
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Activity className="h-4 w-4 text-green-500" /> Enrollment Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? <Pulse /> : c?.enrollmentStatus.every(d => d.value === 0)
                            ? <EmptyChart label="enrollments" />
                            : (
                                <ResponsiveContainer width="100%" height={260}>
                                    <PieChart>
                                        <Pie data={c?.enrollmentStatus} cx="50%" cy="45%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value">
                                            {c?.enrollmentStatus.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
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

            {/* My enrolled classes */}
            <Card>
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-blue-500" /> My Classes
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={() => navigate('/enrollments')}>View All</Button>
                </CardHeader>
                <CardContent>
                    {loading
                        ? <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Pulse key={i} h="h-16" />)}</div>
                        : !stats?.enrolledClasses.length
                            ? (
                                <div className="text-center py-10 space-y-3">
                                    <p className="text-sm text-muted-foreground">You aren't enrolled in any classes yet.</p>
                                    <Button size="sm" onClick={() => navigate('/classes')}>Browse Classes</Button>
                                </div>
                            )
                            : (
                                <div className="space-y-1">
                                    {stats.enrolledClasses.map((cls, i) => {
                                        const schedules = cls.schedules ?? [];
                                        return (
                                            <div key={cls.id}>
                                                <div
                                                    className="flex items-start justify-between gap-3 py-3 cursor-pointer hover:bg-muted/40 rounded-lg px-2 -mx-2 transition-colors"
                                                    onClick={() => navigate(`/classes/show/${cls.id}`)}
                                                >
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-medium truncate">{cls.name}</p>
                                                        <p className="text-xs text-muted-foreground truncate">
                                                            {cls.subjectName ?? '—'} · {cls.teacherName ?? '—'}
                                                        </p>
                                                        {schedules.length > 0 && (
                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                {schedules.slice(0, 3).map((s, si) => (
                                                                    <span key={si} className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-medium">
                                                                        {DAY_SHORT[s.day] ?? s.day} {s.startTime}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                                        <Badge variant={cls.status === 'active' ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">
                                                            {cls.status}
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground">
                                                            {Number(cls.enrolledCount)}/{Number(cls.capacity)} students
                                                        </span>
                                                    </div>
                                                </div>
                                                {i < stats.enrolledClasses.length - 1 && <Separator />}
                                            </div>
                                        );
                                    })}
                                </div>
                            )
                    }
                </CardContent>
            </Card>
        </div>
    );
}

// ─── Root Dashboard ─────────────────────────────────────────────────────────────

const Dashboard = () => {
    const { user } = useAuth();

    if (user?.role === 'student') return <StudentDashboard name={user.name} />;
    if (user?.role === 'teacher') return <TeacherDashboard name={user.name} />;
    return <AdminDashboard />;
};

export default Dashboard;
