import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GraduationCap, School, Shield, Mail, Check, X } from "lucide-react";

const ROLE_META = {
    admin: {
        label: "Administrator",
        Icon: Shield,
        colorClass: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        about: [
            "View and manage all departments",
            "View and manage all subjects",
            "View and manage all classes",
            "Manage users",
            "Access full dashboard analytics",
        ],
    },
    teacher: {
        label: "Teacher",
        Icon: School,
        colorClass: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        about: [
            "View all classes",
            "Access dashboard",
        ],
    },
    student: {
        label: "Student",
        Icon: GraduationCap,
        colorClass: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        about: [
            "Join classes using invite codes",
            "View enrolled class details",
            "Leave classes",
        ],
    },
} as const;

const ALL_PERMISSIONS = [
    "Manage Departments",
    "Manage Subjects",
    "Manage Classes",
    "Manage Users",
    "View Analytics",
    "Join / Leave Classes",
];

const ROLE_PERMISSIONS: Record<string, string[]> = {
    admin: ["Manage Departments", "Manage Subjects", "Manage Classes", "Manage Users", "View Analytics"],
    teacher: ["Manage Classes", "View Analytics"],
    student: ["Join / Leave Classes"],
};

export default function MyAccount() {
    const { user, isLoading } = useAuth();

    if (isLoading) return null;
    if (!user) {
        return (
            <div className="text-center text-muted-foreground py-20">Not signed in.</div>
        );
    }

    const role = user.role in ROLE_META ? user.role : "student";
    const meta = ROLE_META[role as keyof typeof ROLE_META];
    const { Icon } = meta;
    const userPerms = ROLE_PERMISSIONS[role] ?? [];

    const initials = user.name
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="space-y-6 pb-10 max-w-xl">
            <div>
                <h1 className="page-title">My Account</h1>
                <p className="text-sm text-muted-foreground mt-1">Your profile, role, and permissions</p>
            </div>
            <Separator />

            {/* Profile */}
            <Card>
                <CardContent className="p-6 flex flex-col sm:flex-row gap-5 items-start">
                    <Avatar className="h-20 w-20 text-2xl shrink-0">
                        {user.image && <AvatarImage src={user.image} alt={user.name} />}
                        <AvatarFallback className="text-xl font-bold">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-2 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-xl font-bold">{user.name}</h2>
                            <span
                                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${meta.colorClass}`}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                {meta.label}
                            </span>
                        </div>
                        <p className="flex items-center gap-1.5 text-sm text-muted-foreground truncate">
                            <Mail className="h-4 w-4 shrink-0" />
                            {user.email}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Permissions matrix */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Permissions</CardTitle>
                </CardHeader>
                <Separator />
                <CardContent className="pt-4">
                    <div className="space-y-2">
                        {ALL_PERMISSIONS.map(perm => {
                            const has = userPerms.includes(perm);
                            return (
                                <div key={perm} className="flex items-center justify-between py-1.5">
                                    <span className={`text-sm ${has ? "text-foreground" : "text-muted-foreground/60"}`}>
                                        {perm}
                                    </span>
                                    {has ? (
                                        <Check className="h-4 w-4 text-green-500 shrink-0" />
                                    ) : (
                                        <X className="h-4 w-4 text-muted-foreground/30 shrink-0" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* What you can do */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">What you can do as a {meta.label}</CardTitle>
                </CardHeader>
                <Separator />
                <CardContent className="pt-4">
                    <ul className="space-y-2">
                        {meta.about.map(item => (
                            <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Check className="h-4 w-4 text-primary shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
