'use client';

import { useCallback, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  MapPin,
  Bell,
  Plus,
  FileText,
  Map,
  User,
  LogOut,
  X,
  ShieldCheck,
  BarChart3,
  Users,
  AlertCircle,
  Flame,
  Home,
  Info,
  Mail,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/shared/Logo';
import { Avatar } from '@/components/shared/Avatar';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationStore } from '@/store/notificationStore';
import { useUIStore } from '@/store/uiStore';
import { ROUTES } from '@/lib/constants';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

const CITIZEN_NAV: NavItem[] = [
  { label: 'Dashboard',     href: ROUTES.DASHBOARD,     icon: LayoutDashboard },
  { label: 'Issue Feed',    href: ROUTES.ISSUES,        icon: AlertCircle     },
  { label: 'Map View',      href: ROUTES.MAP,           icon: Map             },
  { label: 'My Reports',    href: ROUTES.MY_REPORTS,    icon: FileText        },
  { label: 'Notifications', href: ROUTES.NOTIFICATIONS, icon: Bell            },
  { label: 'Profile',       href: ROUTES.PROFILE,       icon: User            },
];

const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard',     href: ROUTES.ADMIN_DASHBOARD,  icon: LayoutDashboard },
  { label: 'Issue Feed',    href: ROUTES.ISSUES,           icon: AlertCircle     },
  { label: 'Map View',      href: ROUTES.MAP,              icon: Map             },
  { label: 'Moderation',    href: ROUTES.ADMIN_ISSUES,     icon: ShieldCheck     },
  { label: 'Analytics',     href: ROUTES.ADMIN_ANALYTICS,  icon: BarChart3       },
  { label: 'Users',         href: ROUTES.ADMIN_USERS,      icon: Users           },
  { label: 'Notifications', href: ROUTES.NOTIFICATIONS,    icon: Bell            },
  { label: 'Profile',       href: ROUTES.PROFILE,          icon: User            },
];

const PUBLIC_NAV: NavItem[] = [
  { label: 'Home',    href: ROUTES.HOME,    icon: Home },
  { label: 'About',   href: ROUTES.ABOUT,   icon: Info },
  { label: 'Contact', href: ROUTES.CONTACT, icon: Mail },
];

export function MobileDrawer() {
  const pathname = usePathname();
  const { user, isAdmin, isAuthenticated, handleLogout } = useAuth();
  const { unreadCount } = useNotificationStore();
  const { mobileDrawerOpen, setMobileDrawerOpen } = useUIStore();

  const navItems = isAuthenticated
    ? isAdmin
      ? ADMIN_NAV
      : CITIZEN_NAV
    : PUBLIC_NAV;

  const close = useCallback(() => setMobileDrawerOpen(false), [setMobileDrawerOpen]);

  const isActive = useCallback(
    (href: string) => {
      if (href === '/' || href === ROUTES.DASHBOARD || href === ROUTES.ADMIN_DASHBOARD)
        return pathname === href;
      return pathname.startsWith(href);
    },
    [pathname]
  );

  // Close on route change
  useEffect(() => {
    close();
  }, [pathname, close]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileDrawerOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [close]);

  return (
    <AnimatePresence>
      {mobileDrawerOpen && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            key="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            aria-hidden="true"
          />

          {/* ── Drawer Panel ── */}
          <motion.div
            key="drawer-panel"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className={cn(
              'fixed left-0 top-0 bottom-0 z-50 lg:hidden',
              'w-72 max-w-[85vw]',
              'bg-white dark:bg-gray-900',
              'flex flex-col',
              'shadow-2xl'
            )}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
          >
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 dark:border-gray-800">
              <Logo size="sm" subtitle={isAdmin ? 'Admin Portal' : 'Citizen Portal'} />
              <button
                onClick={close}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ── Report Issue CTA ── */}
            {isAuthenticated && (
              <div className="px-4 pt-4 pb-2">
                <Link
                  href={ROUTES.REPORT}
                  onClick={close}
                  className={cn(
                    'flex items-center justify-center gap-2',
                    'w-full px-4 py-3 rounded-xl',
                    'bg-blue-600 hover:bg-blue-700',
                    'text-white font-semibold text-sm',
                    'shadow-md shadow-blue-500/25',
                    'transition-colors'
                  )}
                >
                  <Plus className="w-4 h-4" />
                  Report Issue
                </Link>
              </div>
            )}

            {/* ── Navigation ── */}
            <nav className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
              <p className="px-3 py-1 text-[10px] font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-widest">
                {isAuthenticated ? (isAdmin ? 'Management' : 'Navigation') : 'Menu'}
              </p>

              {navItems.map((item, idx) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                const badge =
                  item.href === ROUTES.NOTIFICATIONS ? unreadCount : 0;

                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.2 }}
                  >
                    <Link
                      href={item.href}
                      onClick={close}
                      className={cn(
                        'flex items-center gap-3 px-3 py-3 rounded-xl',
                        'text-sm font-medium transition-all duration-150',
                        active
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                      )}
                    >
                      <Icon className={cn('w-5 h-5', active ? 'text-white' : '')} />
                      <span className="flex-1">{item.label}</span>
                      {badge > 0 && (
                        <span
                          className={cn(
                            'min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold',
                            'flex items-center justify-center',
                            active
                              ? 'bg-white/20 text-white'
                              : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                          )}
                        >
                          {badge > 99 ? '99+' : badge}
                        </span>
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* ── User Section ── */}
            {isAuthenticated && user ? (
              <div className="border-t border-gray-100 dark:border-gray-800 p-4 space-y-3">
                {/* Reputation card */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Flame className="w-3.5 h-3.5 text-orange-500" />
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Reputation Points
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-blue-600">
                      {user.reputationPoints.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500">pts</span>
                  </div>
                  <div className="mt-1.5 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min((user.reputationPoints / 500) * 100, 100)}%`,
                      }}
                      transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                    />
                  </div>
                </div>

                {/* User info */}
                <div className="flex items-center gap-3 p-2">
                  <Avatar user={user} size="md" showBadge />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Logout */}
                <button
                  onClick={() => {
                    handleLogout();
                    close();
                  }}
                  className={cn(
                    'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl',
                    'text-sm font-medium text-red-500 dark:text-red-400',
                    'hover:bg-red-50 dark:hover:bg-red-900/20',
                    'transition-colors'
                  )}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="border-t border-gray-100 dark:border-gray-800 p-4 space-y-2">
                <Link
                  href={ROUTES.LOGIN}
                  onClick={close}
                  className="flex items-center justify-center w-full px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors"
                >
                  Login
                </Link>
                <Link
                  href={ROUTES.REGISTER}
                  onClick={close}
                  className="flex items-center justify-center w-full px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}