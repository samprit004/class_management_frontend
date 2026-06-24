import { Authenticated, Refine } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import { Home, Book, GraduationCap, Building2, BookOpen } from "lucide-react";
import { Layout } from "./components/refine-ui/layout/layout";
import { Navigate, Outlet } from "react-router";

import Dashboard from "./pages/Dashboard";
import DepartmentsList from "./pages/departments/List";
import DepartmentsCreate from "./pages/departments/Create";
import SubjectsList from "./pages/subjects/List";
import SubjectsCreate from "./pages/subjects/Create";
import ClassesList from "./pages/classes/List";
import ClassesCreate from "./pages/classes/Create";
import ClassesShow from "./pages/classes/Show";
import EnrollmentsList from "./pages/enrollments/List";
import MyAccount from "./pages/account/MyAccount";
import LoginPage from "./pages/auth/Login";
import RegisterPage from "./pages/auth/Register";

import routerProvider, {
  DocumentTitleHandler,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
import { BrowserRouter, Route, Routes } from "react-router";
import "./App.css";
import { Toaster } from "./components/refine-ui/notification/toaster";
import { useNotificationProvider } from "./components/refine-ui/notification/use-notification-provider";
import { ThemeProvider } from "./components/refine-ui/theme/theme-provider";
import { dataProvider } from "./providers/data";
import { authProvider } from "./providers/auth";
import { AuthContextProvider, useAuth } from "./contexts/AuthContext";
import { CookieBanner } from "./components/CookieBanner";

function RequireRole({ allowed, children }: { allowed: string[]; children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return null;
  if (!allowed.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function buildResources(role?: string | null) {
  const dashboard = {
    name: "dashboard",
    list: "/",
    meta: { label: "Home", icon: <Home /> },
  };

  const departments = {
    name: "departments",
    list: "/departments",
    create: "/departments/create",
    meta: { label: "Departments", icon: <Building2 /> },
  };

  const subjects = {
    name: "subjects",
    list: "/subjects",
    create: "/subjects/create",
    meta: { label: "Subjects", icon: <Book /> },
  };

  const classesAdmin = {
    name: "classes",
    list: "/classes",
    create: "/classes/create",
    show: "/classes/show/:id",
    meta: { label: "Classes", icon: <GraduationCap /> },
  };

  // read-only view of departments/subjects for non-admins (no create)
  const departmentsReadOnly = {
    name: "departments",
    list: "/departments",
    meta: { label: "Departments", icon: <Building2 /> },
  };

  const subjectsReadOnly = {
    name: "subjects",
    list: "/subjects",
    meta: { label: "Subjects", icon: <Book /> },
  };

  const classesReadOnly = {
    name: "classes",
    list: "/classes",
    show: "/classes/show/:id",
    meta: { label: "Classes", icon: <GraduationCap /> },
  };

  const enrollments = {
    name: "enrollments",
    list: "/enrollments",
    meta: { label: "My Enrollments", icon: <BookOpen /> },
  };

  if (role === "admin") {
    return [dashboard, departments, subjects, classesAdmin];
  }

  if (role === "teacher") {
    // Teachers see everything the admin sees including create
    return [dashboard, departments, subjects, classesAdmin];
  }

  if (role === "student") {
    // Students see all browse sections (read-only) + their enrollments
    return [dashboard, enrollments, departmentsReadOnly, subjectsReadOnly, classesReadOnly];
  }

  return [dashboard];
}

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-svh flex items-center justify-center">
        <GraduationCap className="h-12 w-12 text-primary animate-pulse" />
      </div>
    );
  }

  const resources = buildResources(user?.role);

  return (
    <RefineKbarProvider>
      <DevtoolsProvider>
        <Refine
          authProvider={authProvider}
          dataProvider={dataProvider}
          notificationProvider={useNotificationProvider()}
          routerProvider={routerProvider}
          resources={resources}
          options={{
            syncWithLocation: true,
            warnWhenUnsavedChanges: true,
            projectId: "Imt2VG-YRf85J-1TGWRs",
          }}
        >
          <Routes>
            {/* Public auth routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected routes */}
            <Route
              element={
                <Authenticated
                  key="auth-protected"
                  fallback={<Navigate to="/login" replace />}
                >
                  <Layout>
                    <Outlet />
                  </Layout>
                </Authenticated>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="account" element={<MyAccount />} />

              <Route path="departments">
                <Route index element={<DepartmentsList />} />
                <Route path="create" element={<RequireRole allowed={["admin", "teacher"]}><DepartmentsCreate /></RequireRole>} />
              </Route>
              <Route path="subjects">
                <Route index element={<SubjectsList />} />
                <Route path="create" element={<RequireRole allowed={["admin", "teacher"]}><SubjectsCreate /></RequireRole>} />
              </Route>
              <Route path="classes">
                <Route index element={<ClassesList />} />
                <Route path="create" element={<RequireRole allowed={["admin", "teacher"]}><ClassesCreate /></RequireRole>} />
                <Route path="show/:id" element={<ClassesShow />} />
              </Route>

              {/* Student */}
              <Route path="enrollments" element={<EnrollmentsList />} />
            </Route>
          </Routes>

          <Toaster />
          <RefineKbar />
          <UnsavedChangesNotifier />
          <DocumentTitleHandler />
        </Refine>
        <DevtoolsPanel />
      </DevtoolsProvider>
    </RefineKbarProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthContextProvider>
          <AppContent />
          <CookieBanner />
        </AuthContextProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
