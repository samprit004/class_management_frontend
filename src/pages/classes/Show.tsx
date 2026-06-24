import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { BACKEND_BASE_URL } from "@/constants";
import { ClassDetails } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import {
    ArrowLeft,
    Users,
    BookOpen,
    Building2,
    Clock,
    Hash,
    Calendar,
    GraduationCap,
} from "lucide-react";

const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const ClassesShow = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const back = () => navigate("/classes");

    const [cls, setCls] = useState<ClassDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        if (!id) {
            setIsError(true);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setIsError(false);

        fetch(`${BACKEND_BASE_URL}/classes/${id}`)
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then((payload) => {
                const data: ClassDetails = payload?.data ?? payload;
                if (!data || !data.id) throw new Error("No class data");
                setCls(data);
            })
            .catch((err) => {
                console.error("Failed to fetch class:", err);
                setIsError(true);
            })
            .finally(() => setIsLoading(false));
    }, [id]);

    if (isLoading) {
        return (
            <div className="class-show class-view">
                <Breadcrumb />
                <Skeleton className="h-8 w-48 mt-4" />
                <Skeleton className="mt-5 w-full aspect-5/1 rounded-xl" />
                <div className="mt-6 space-y-4">
                    <Skeleton className="h-7 w-64" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-3/4" />
                </div>
            </div>
        );
    }

    if (isError || !cls) {
        return (
            <div className="class-show class-view">
                <Breadcrumb />
                <p className="state-message is-error">Failed to load class details. Please try again.</p>
                <Button variant="outline" className="mt-4" onClick={back}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
                </Button>
            </div>
        );
    }

    const enrolledCount = Number(cls.enrollmentCount ?? 0);
    const fillPercent = cls.capacity > 0 ? Math.min(100, Math.round((enrolledCount / cls.capacity) * 100)) : 0;

    const sortedSchedules = [...(cls.schedules ?? [])].sort(
        (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day)
    );

    return (
        <div className="class-show class-view">
            <div className="flex items-center gap-2 justify-between">
                <Breadcrumb />
                <Button variant="ghost" size="sm" onClick={back}>
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back
                </Button>
            </div>

            {/* Banner */}
            <div className="banner">
                {cls.bannerUrl ? (
                    <img src={cls.bannerUrl} alt={`${cls.name} banner`} />
                ) : (
                    <div className="placeholder rounded-xl flex items-center justify-center">
                        <GraduationCap className="h-16 w-16 text-muted-foreground/30" />
                    </div>
                )}
            </div>

            {/* Main card */}
            <Card className="details-card">
                <CardContent className="p-0">
                    {/* Header: name + status */}
                    <div className="details-header">
                        <div>
                            <h1>{cls.name}</h1>
                            {cls.description && <p>{cls.description}</p>}
                        </div>
                        <div>
                            <Badge data-status={cls.status}>
                                {cls.status.charAt(0).toUpperCase() + cls.status.slice(1)}
                            </Badge>
                        </div>
                    </div>

                    {/* Enrollment progress */}
                    <div className="space-y-2 mb-6">
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                                <Users className="h-4 w-4" />
                                Enrollment
                            </span>
                            <span className="font-semibold">
                                {enrolledCount} / {cls.capacity} students
                            </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                            <div
                                className="h-full rounded-full bg-primary transition-all"
                                style={{ width: `${fillPercent}%` }}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">{fillPercent}% capacity filled</p>
                    </div>

                    <Separator className="my-5" />

                    {/* Details grid */}
                    <div className="details-grid">
                        {/* Instructor */}
                        {cls.teacher && (
                            <div className="instructor">
                                <p>Instructor</p>
                                <div>
                                    {cls.teacher.image ? (
                                        <img src={cls.teacher.image} alt={cls.teacher.name} />
                                    ) : (
                                        <div className="size-13 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                                            {cls.teacher.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <p>{cls.teacher.name}</p>
                                        <p>{cls.teacher.email}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Subject */}
                        {cls.subject && (
                            <div className="subject">
                                <p>Subject</p>
                                <div>
                                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono mb-1">
                                        <Hash className="h-3 w-3" />
                                        {cls.subject.code}
                                    </span>
                                    <p className="flex items-center gap-1.5">
                                        <BookOpen className="h-4 w-4 text-primary" />
                                        {cls.subject.name}
                                    </p>
                                    {cls.subject.description && (
                                        <p>{cls.subject.description}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Department */}
                        {cls.department && (
                            <div className="department">
                                <p>Department</p>
                                <div>
                                    <p className="flex items-center gap-1.5">
                                        <Building2 className="h-4 w-4 text-primary" />
                                        {cls.department.name}
                                    </p>
                                    {cls.department.description && (
                                        <p>{cls.department.description}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Invite / join */}
                        {cls.inviteCode && (
                            <div className="join">
                                <h2>How to Join</h2>
                                <ol>
                                    <li>Open the classroom app and sign in as a student.</li>
                                    <li>
                                        Enter invite code:{" "}
                                        <code className="font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                                            {cls.inviteCode}
                                        </code>
                                    </li>
                                    <li>Click <strong>Join Class</strong> to enroll.</li>
                                </ol>
                            </div>
                        )}
                    </div>

                    {/* Schedule */}
                    {sortedSchedules.length > 0 && (
                        <>
                            <Separator className="my-5" />
                            <div className="space-y-3">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5" />
                                    Schedule
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {sortedSchedules.map((s, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm"
                                        >
                                            <span className="font-semibold min-w-[80px]">{s.day}</span>
                                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span className="text-muted-foreground">
                                                {s.startTime} – {s.endTime}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Created at */}
                    {cls.createdAt && (
                        <>
                            <Separator className="my-5" />
                            <p className="text-xs text-muted-foreground">
                                Created on{" "}
                                {new Date(cls.createdAt).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </p>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ClassesShow;
