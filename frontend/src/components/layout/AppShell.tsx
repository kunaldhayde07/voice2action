'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileDrawer } from './MobileDrawer';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/lib/constants';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { Logo } from '@/components/shared/Logo';

interface AppShellProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  className?: string;
}

export function AppShell({
  children,
  requireAdmin = false,
  className,
}: AppShellProps) {
  const router = useRouter();
  const { isAuthenticated, isAdmin, user } = useAuth();
  const { isLoading } = useAuthStore();

  // Initialize socket connection
  useSocket();

  // Initialize notification polling
  useNotifications(true);

  // Auth guard
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace(ROUTES.LOGIN);
        return;
      }

      if (requireAdmin && !isAdmin) {
        router.replace(ROUTES.DASHBOARD);
      }
    }
  }, [isAuthenticated, isAdmin, isLoading, requireAdmin, router]);

  // Show loader while checking auth
  if (isLoading || !isAuthenticated) {
    return <PageLoader label="Authenticating..." />;
  }

  if (requireAdmin && !isAdmin) {
    return <PageLoader label="Checking permissions..." />;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* ── Desktop Sidebar ── */}
      <Sidebar />

      {/* ── Mobile Drawer ── */}
      <MobileDrawer />

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Sticky TopBar */}
        <TopBar />

        {/* Page Content */}
        <main
          className={cn(
            'flex-1 overflow-y-auto',
            'bg-gray-50 dark:bg-gray-950'
          )}
        >
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={cn('p-4 lg:p-6 max-w-[1600px] mx-auto w-full', className)}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

// ─── Auth Layout Shell (for login/register pages) ─────────────────────────

interface AuthShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function AuthShell({ children }: AuthShellProps) {
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(isAdmin ? ROUTES.ADMIN_DASHBOARD : ROUTES.DASHBOARD);
    }
  }, [isAuthenticated, isAdmin, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 flex flex-col">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/30 dark:bg-blue-900/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200/30 dark:bg-indigo-900/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-100/20 dark:bg-blue-800/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex justify-center pt-8 pb-4">
        <Logo size="md" href="/" subtitle="Civic Tech Platform" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          {children}
        </motion.div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center pb-6">
        <p className="text-xs text-gray-400 dark:text-gray-600">
          © {new Date().getFullYear()} Voice2Action. Empowering Citizens.
        </p>
      </div>
    </div>
  );
}

// ─── Public Layout Shell (for landing, about, contact) ────────────────────

interface PublicShellProps {
  children: React.ReactNode;
}

export function PublicShell({ children }: PublicShellProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      {/* Public Navbar */}
      <PublicNavbar />

      {/* Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <PublicFooter />

      {/* Mobile Drawer */}
      <MobileDrawer />
    </div>
  );
}

// ─── Public Navbar ────────────────────────────────────────────────────────

function PublicNavbar() {
  const { isAuthenticated, isAdmin } = useAuth();
  const { setMobileDrawerOpen } = useUIStore();
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <nav className="sticky top-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Logo size="sm" />

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          <Link href={ROUTES.HOME} className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 font-medium transition-colors">Home</Link>
          <Link href={ROUTES.ABOUT} className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 font-medium transition-colors">About</Link>
          <Link href={ROUTES.CONTACT} className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 font-medium transition-colors">Contact</Link>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
          >
            {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {isAuthenticated ? (
            <Link
              href={isAdmin ? ROUTES.ADMIN_DASHBOARD : ROUTES.DASHBOARD}
              className="hidden md:inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-xl text-sm transition-colors"
            >
              Go to Dashboard
            </Link>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href={ROUTES.LOGIN} className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                Login
              </Link>
              <Link href={ROUTES.REGISTER} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-xl text-sm transition-colors">
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}

// ─── Public Footer ────────────────────────────────────────────────────────

function PublicFooter() {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-400 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <Logo size="sm" showText className="mb-3 [&_span]:text-white" />
            <p className="text-sm leading-relaxed">
              Empowering citizens to report and resolve local civic issues for a better community.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Platform</h4>
            <div className="space-y-2">
              {[['Issue Feed', ROUTES.ISSUES], ['Map View', ROUTES.MAP], ['Report Issue', ROUTES.REPORT]].map(([label, href]) => (
                <Link key={href} href={href} className="block text-sm hover:text-white transition-colors">{label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Company</h4>
            <div className="space-y-2">
              {[['About', ROUTES.ABOUT], ['Contact', ROUTES.CONTACT]].map(([label, href]) => (
                <Link key={href} href={href} className="block text-sm hover:text-white transition-colors">{label}</Link>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-6 text-center text-xs">
          © {new Date().getFullYear()} Voice2Action. Built for communities. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

// missing imports for PublicNavbar/Footer
import Link from 'next/link';
import { Sun, Moon, Menu } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useUIStore } from '@/store/uiStore';