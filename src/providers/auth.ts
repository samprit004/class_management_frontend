import type { AuthProvider } from "@refinedev/core";
import { BACKEND_BASE_URL } from "@/constants";

const authFetch = (path: string, init?: RequestInit) =>
    fetch(`${BACKEND_BASE_URL}/auth${path}`, {
        ...init,
        credentials: "include",
        headers: { "Content-Type": "application/json", ...init?.headers },
    });

export const authProvider: AuthProvider = {
    login: async ({ email, password, rememberMe }) => {
        try {
            const res = await authFetch("/sign-in/email", {
                method: "POST",
                body: JSON.stringify({ email, password, rememberMe: rememberMe ?? false }),
            });
            if (res.ok) return { success: true, redirectTo: "/" };
            const data = await res.json().catch(() => ({}));
            return {
                success: false,
                error: {
                    name: "LoginError",
                    message: data?.message ?? "Invalid email or password",
                },
            };
        } catch {
            return {
                success: false,
                error: { name: "NetworkError", message: "Could not reach the server" },
            };
        }
    },

    register: async ({ name, email, password, role }) => {
        try {
            const res = await authFetch("/sign-up/email", {
                method: "POST",
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    role: role ?? "student",
                }),
            });
            if (res.ok) return { success: true };
            const data = await res.json().catch(() => ({}));
            return {
                success: false,
                error: {
                    name: "RegistrationError",
                    message: data?.message ?? "Could not create account",
                },
            };
        } catch {
            return {
                success: false,
                error: { name: "NetworkError", message: "Could not reach the server" },
            };
        }
    },

    logout: async () => {
        try {
            await authFetch("/sign-out", { method: "POST" });
        } catch {}
        return { success: true, redirectTo: "/login" };
    },

    check: async () => {
        try {
            const res = await authFetch("/get-session");
            if (res.ok) {
                const data = await res.json();
                if (data?.user) return { authenticated: true };
            }
        } catch {}
        return { authenticated: false, redirectTo: "/login" };
    },

    getIdentity: async () => {
        try {
            const res = await authFetch("/get-session");
            if (res.ok) {
                const data = await res.json();
                if (data?.user) {
                    const u = data.user;
                    return {
                        id: u.id,
                        name: u.name,
                        email: u.email,
                        avatar: u.image ?? undefined,
                        role: u.role,
                        fullName: u.name,
                    };
                }
            }
        } catch {}
        return null;
    },

    getPermissions: async () => {
        try {
            const res = await authFetch("/get-session");
            if (res.ok) {
                const data = await res.json();
                return data?.user?.role ?? null;
            }
        } catch {}
        return null;
    },

    onError: async (error) => {
        if (error?.status === 401) return { logout: true, redirectTo: "/login" };
        return { error };
    },
};
