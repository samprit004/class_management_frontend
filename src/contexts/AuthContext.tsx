import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { BACKEND_BASE_URL } from "@/constants";

export type AppUser = {
    id: string;
    name: string;
    email: string;
    role: "student" | "teacher" | "admin";
    image?: string | null;
};

type AuthContextType = {
    user: AppUser | null;
    isLoading: boolean;
    refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    refresh: async () => {},
});

export function AuthContextProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AppUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            const res = await fetch(`${BACKEND_BASE_URL}/auth/get-session`, {
                credentials: "include",
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data?.user ?? null);
            } else {
                setUser(null);
            }
        } catch {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return (
        <AuthContext.Provider value={{ user, isLoading, refresh }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
