import { UserAvatar } from "@/components/refine-ui/layout/user-avatar";
import { ThemeToggle } from "@/components/refine-ui/theme/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
  useActiveAuthProvider,
  useLogout,
  useRefineOptions,
} from "@refinedev/core";
import { LogOutIcon, UserCircle, Shield, School, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "@/contexts/AuthContext";

const ROLE_BADGES = {
  admin: { label: "Admin", Icon: Shield, cls: "text-red-500" },
  teacher: { label: "Teacher", Icon: School, cls: "text-blue-500" },
  student: { label: "Student", Icon: GraduationCap, cls: "text-green-500" },
} as const;

export const Header = () => {
  const { isMobile } = useSidebar();
  return <>{isMobile ? <MobileHeader /> : <DesktopHeader />}</>;
};

function DesktopHeader() {
  return (
    <header
      className={cn(
        "sticky top-0 flex h-16 shrink-0 items-center gap-4",
        "border-b border-border bg-sidebar pr-3 justify-end z-40"
      )}
    >
      <ThemeToggle />
      <UserDropdown />
    </header>
  );
}

function MobileHeader() {
  const { open, isMobile } = useSidebar();
  const { title } = useRefineOptions();

  return (
    <header
      className={cn(
        "sticky top-0 flex h-12 shrink-0 items-center gap-2",
        "border-b border-border bg-sidebar pr-3 justify-between z-40"
      )}
    >
      <SidebarTrigger
        className={cn("text-muted-foreground rotate-180 ml-1", {
          "opacity-0": open,
          "opacity-100": !open || isMobile,
          "pointer-events-auto": !open || isMobile,
          "pointer-events-none": open && !isMobile,
        })}
      />
      <div
        className={cn(
          "whitespace-nowrap flex flex-row h-full items-center justify-start gap-2",
          "transition-discrete duration-200",
          { "pl-3": !open, "pl-5": open }
        )}
      >
        <div>{title.icon}</div>
        <h2
          className={cn("text-sm font-bold transition-opacity duration-200", {
            "opacity-0": !open,
            "opacity-100": open,
          })}
        >
          {title.text}
        </h2>
      </div>
      <ThemeToggle className={cn("h-8 w-8")} />
    </header>
  );
}

const UserDropdown = () => {
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const authProvider = useActiveAuthProvider();
  const { user, refresh } = useAuth();
  const navigate = useNavigate();

  if (!authProvider?.getIdentity) return null;

  const roleMeta = user?.role ? ROLE_BADGES[user.role as keyof typeof ROLE_BADGES] : null;

  const handleLogout = async () => {
    logout(
      {},
      {
        onSuccess: async () => {
          await refresh();
          navigate("/login");
        },
      }
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        <UserAvatar />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {user && (
          <>
            <DropdownMenuLabel className="pb-1">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              {roleMeta && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 text-[10px] font-semibold mt-1",
                    roleMeta.cls
                  )}
                >
                  <roleMeta.Icon className="h-3 w-3" />
                  {roleMeta.label}
                </span>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem onClick={() => navigate("/account")}>
          <UserCircle className="h-4 w-4 mr-2 text-muted-foreground" />
          <span>My Account</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          className="text-destructive focus:text-destructive"
        >
          <LogOutIcon className="h-4 w-4 mr-2" />
          <span>{isLoggingOut ? "Logging out…" : "Logout"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

Header.displayName = "Header";
MobileHeader.displayName = "MobileHeader";
DesktopHeader.displayName = "DesktopHeader";
