import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { useRegister, useNotification } from "@refinedev/core";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { InputPassword } from "@/components/refine-ui/form/input-password";
import { ThemeToggle } from "@/components/refine-ui/theme/theme-toggle";
import { GraduationCap, School, Loader2 } from "lucide-react";

type Role = "student" | "teacher";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [role, setRole] = useState<Role>("student");
    const [busy, setBusy] = useState(false);

    const { mutate: register } = useRegister<{
        name: string;
        email: string;
        password: string;
        role: Role;
    }>();
    const { open } = useNotification();
    const { user, isLoading, refresh } = useAuth();
    const navigate = useNavigate();

    if (!isLoading && user) return <Navigate to="/" replace />;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirm) {
            open?.({ type: "error", message: "Passwords do not match" });
            return;
        }
        if (password.length < 8) {
            open?.({ type: "error", message: "Password must be at least 8 characters" });
            return;
        }
        setBusy(true);
        register(
            { name, email, password, role },
            {
                onSuccess: async () => {
                    await refresh();
                    navigate("/");
                },
                onError: (err: any) => {
                    open?.({ type: "error", message: err?.message ?? "Registration failed" });
                    setBusy(false);
                },
            }
        );
    };

    return (
        <div className="min-h-svh flex flex-col items-center justify-center px-4 py-12 relative bg-background">
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>

            <div className="flex flex-col items-center gap-2 mb-8">
                <div className="p-3 rounded-2xl bg-primary/10">
                    <GraduationCap className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">Classroom</h1>
                <p className="text-sm text-muted-foreground">Create your account to get started</p>
            </div>

            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xl">Get started</CardTitle>
                    <CardDescription>Choose your role and fill in your details</CardDescription>
                </CardHeader>
                <Separator />
                <CardContent className="pt-5">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Role selection */}
                        <div className="space-y-2">
                            <Label>I am a…</Label>
                            <div className="grid grid-cols-2 gap-3">
                                {(
                                    [
                                        { value: "student" as Role, label: "Student", Icon: GraduationCap },
                                        { value: "teacher" as Role, label: "Teacher", Icon: School },
                                    ] as const
                                ).map(({ value, label, Icon }) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setRole(value)}
                                        className={[
                                            "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all cursor-pointer",
                                            role === value
                                                ? "border-primary bg-primary/5 text-primary"
                                                : "border-border hover:border-primary/40 text-muted-foreground",
                                        ].join(" ")}
                                    >
                                        <Icon className="h-6 w-6" />
                                        <span className="text-sm font-semibold">{label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                placeholder="Jane Doe"
                                autoComplete="name"
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="password">Password</Label>
                            <InputPassword
                                id="password"
                                placeholder="Min. 8 characters"
                                autoComplete="new-password"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="confirm">Confirm Password</Label>
                            <InputPassword
                                id="confirm"
                                placeholder="Repeat password"
                                autoComplete="new-password"
                                required
                                value={confirm}
                                onChange={e => setConfirm(e.target.value)}
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={busy}>
                            {busy ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Creating account…
                                </>
                            ) : (
                                "Create account"
                            )}
                        </Button>
                    </form>
                </CardContent>
                <Separator />
                <CardFooter className="justify-center py-4">
                    <p className="text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link to="/login" className="font-semibold text-primary hover:underline">
                            Sign in
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
