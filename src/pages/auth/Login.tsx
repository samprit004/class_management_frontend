import { useState } from "react";
import { Link, Navigate } from "react-router";
import { useLogin, useNotification } from "@refinedev/core";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { InputPassword } from "@/components/refine-ui/form/input-password";
import { ThemeToggle } from "@/components/refine-ui/theme/theme-toggle";
import { GraduationCap, Loader2 } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [busy, setBusy] = useState(false);

    const { mutate: login } = useLogin<{ email: string; password: string; rememberMe: boolean }>();
    const { open } = useNotification();
    const { user, isLoading, refresh } = useAuth();

    if (!isLoading && user) return <Navigate to="/" replace />;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setBusy(true);
        login(
            { email, password, rememberMe },
            {
                onSuccess: async () => {
                    await refresh();
                },
                onError: (err: any) => {
                    open?.({ type: "error", message: err?.message ?? "Login failed" });
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
                <p className="text-sm text-muted-foreground">Sign in to your account to continue</p>
            </div>

            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xl">Welcome back</CardTitle>
                    <CardDescription>Enter your email and password</CardDescription>
                </CardHeader>
                <Separator />
                <CardContent className="pt-5">
                    <form onSubmit={handleSubmit} className="space-y-4">
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
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="remember"
                                checked={rememberMe}
                                onCheckedChange={v => setRememberMe(v === true)}
                            />
                            <Label htmlFor="remember" className="font-normal text-sm text-muted-foreground cursor-pointer">
                                Remember me for 30 days
                            </Label>
                        </div>
                        <Button type="submit" className="w-full" disabled={busy}>
                            {busy ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Signing in…
                                </>
                            ) : (
                                "Sign in"
                            )}
                        </Button>
                    </form>
                </CardContent>
                <Separator />
                <CardFooter className="justify-center py-4">
                    <p className="text-sm text-muted-foreground">
                        No account?{" "}
                        <Link to="/register" className="font-semibold text-primary hover:underline">
                            Create one
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
