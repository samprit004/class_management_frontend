import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { useNotification } from "@refinedev/core";
import { BACKEND_BASE_URL } from "@/constants";
import { ClassDetails } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { BookOpen, GraduationCap, Search, LogOut, Plus, Loader2 } from "lucide-react";

export default function EnrollmentsList() {
    const [classes, setClasses] = useState<ClassDetails[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [joinOpen, setJoinOpen] = useState(false);
    const [inviteCode, setInviteCode] = useState("");
    const [joining, setJoining] = useState(false);

    const { open } = useNotification();
    const navigate = useNavigate();

    const fetchEnrollments = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${BACKEND_BASE_URL}/enrollments`, { credentials: "include" });
            if (!res.ok) throw new Error();
            const data = await res.json();
            setClasses(data.data ?? []);
        } catch {
            open?.({ type: "error", message: "Failed to load your enrolled classes" });
        } finally {
            setIsLoading(false);
        }
    }, [open]);

    useEffect(() => {
        fetchEnrollments();
    }, [fetchEnrollments]);

    const handleLeave = async (classId: number, className: string) => {
        if (!confirm(`Leave "${className}"? You can rejoin with the invite code.`)) return;
        try {
            const res = await fetch(`${BACKEND_BASE_URL}/enrollments/${classId}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (!res.ok) {
                const d = await res.json().catch(() => ({}));
                throw new Error(d.error ?? "Failed");
            }
            open?.({ type: "success", message: `Left "${className}"` });
            fetchEnrollments();
        } catch (e: any) {
            open?.({ type: "error", message: e.message ?? "Failed to leave class" });
        }
    };

    const handleJoin = async () => {
        if (!inviteCode.trim()) return;
        setJoining(true);
        try {
            const res = await fetch(`${BACKEND_BASE_URL}/enrollments/join`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ inviteCode: inviteCode.trim() }),
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok) {
                open?.({ type: "success", message: "Joined class successfully!" });
                setJoinOpen(false);
                setInviteCode("");
                fetchEnrollments();
            } else {
                open?.({ type: "error", message: data.error ?? "Failed to join class" });
            }
        } catch {
            open?.({ type: "error", message: "Network error. Please try again." });
        } finally {
            setJoining(false);
        }
    };

    const filtered = classes.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.subject?.name ?? "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-5 pb-10">
            <div>
                <h1 className="page-title">My Enrollments</h1>
                <p className="text-sm text-muted-foreground mt-1">Classes you are currently enrolled in</p>
            </div>
            <Separator />

            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="search-field">
                    <Search className="search-icon" />
                    <Input
                        placeholder="Search classes…"
                        className="pl-10 max-w-xs"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <Button onClick={() => setJoinOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Join a Class
                </Button>
            </div>

            {isLoading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-52 rounded-xl" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
                    <GraduationCap className="h-14 w-14 opacity-20" />
                    <p className="text-sm font-medium">
                        {classes.length === 0
                            ? "You aren't enrolled in any classes yet."
                            : "No classes match your search."}
                    </p>
                    {classes.length === 0 && (
                        <Button variant="outline" onClick={() => setJoinOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Join your first class
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map(cls => (
                        <Card key={cls.id} className="overflow-hidden hover:shadow-md transition-shadow">
                            {cls.bannerUrl ? (
                                <img
                                    src={cls.bannerUrl}
                                    alt={cls.name}
                                    className="w-full h-28 object-cover"
                                />
                            ) : (
                                <div className="w-full h-28 bg-primary/10 flex items-center justify-center">
                                    <GraduationCap className="h-10 w-10 text-primary/30" />
                                </div>
                            )}
                            <CardContent className="p-4 space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="font-semibold text-sm truncate">{cls.name}</p>
                                        {cls.subject && (
                                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                <BookOpen className="h-3 w-3 shrink-0" />
                                                <span className="truncate">{cls.subject.name}</span>
                                            </p>
                                        )}
                                    </div>
                                    <Badge
                                        variant={cls.status === "active" ? "default" : "secondary"}
                                        className="shrink-0 text-[10px]"
                                    >
                                        {cls.status}
                                    </Badge>
                                </div>

                                {cls.teacher && (
                                    <p className="text-xs text-muted-foreground truncate">
                                        Teacher:{" "}
                                        <span className="font-medium text-foreground">{cls.teacher.name}</span>
                                    </p>
                                )}

                                <div className="flex gap-2 pt-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => navigate(`/classes/show/${cls.id}`)}
                                    >
                                        View Details
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10 px-2.5"
                                        title="Leave class"
                                        onClick={() => handleLeave(cls.id, cls.name)}
                                    >
                                        <LogOut className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Join by invite code */}
            <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Join a Class</DialogTitle>
                        <DialogDescription>
                            Enter the invite code your teacher shared with you.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 py-2">
                        <Label htmlFor="invite-code">Invite Code</Label>
                        <Input
                            id="invite-code"
                            placeholder="e.g. abc123x"
                            value={inviteCode}
                            onChange={e => setInviteCode(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleJoin()}
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setJoinOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleJoin} disabled={!inviteCode.trim() || joining}>
                            {joining ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Joining…
                                </>
                            ) : (
                                "Join Class"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
