'use client';

import { useCallback } from 'react';
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
  Settings,
  LogOut,
  ShieldCheck,
  BarChart3,
  Users,
  ChevronLeft,
  Flame,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/shared/Logo';
import { Avatar } from '@/components/shared/Avatar';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationStore } from '@/store/notificationStore';
import { useUIStore } from '@/store/uiStore';
import { ROUTES } from '@/lib/constants';

// ─── Nav Item Type ────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number | string;
  adminOnly?: boolean;
  citizenOnly?: boolean;
}

// ─── Nav Config ───────────────────────────────────────────────────────────────

const CITIZEN_NAV: NavItem[] = [
  { label: 'Dashboard',     href: ROUTES.DASHBOARD,    icon: LayoutDashboard },
  { label: 'Issue Feed',    href: ROUTES.ISSUES,       icon: AlertCircle     },
  { label: 'Map View',      href: ROUTES.MAP,          icon: Map             },
  { label: 'My Reports',    href: ROUTES.MY_REPORTS,   icon: FileText        },
  { label: 'Notifications', href: ROUTES.NOTIFICATIONS, icon: Bell           },
  { label: 'Profile',       href: ROUTES.PROFILE,      icon: User            },
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

// ─── Single Nav Item Component ────────────────────────────────────────────────

interface NavItemProps {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
  notificationBadge?: number;
  onClick?: () => void;
}

function SidebarNavItem({
  item,
  isActive,
  isCollapsed,
  notificationBadge,
  onClick,
}: NavItemProps) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        'relative flex items-center gap-3 px-3 py-2.5 rounded-xl',
        'text-sm font-medium transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
        isActive
          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
      )}
      title={isCollapsed ? item.label : undefined}
    >
      {/* Active indicator bar */}
      {isActive && (
        <motion.div
          layoutId="activeNav"
          className="absolute inset-0 bg-blue-600 rounded-xl -z-10"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}

      {/* Icon */}
      <div className="relative flex-shrink-0">
        <Icon className={cn('w-5 h-5', isActive ? 'text-white' : '')} />

        {/* Notification badge on icon (when collapsed) */}
        {isCollapsed && notificationBadge && notificationBadge > 0 ? (
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white">
            {notificationBadge > 9 ? '9+' : notificationBadge}
          </span>
        ) : null}
      </div>

      {/* Label */}
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden whitespace-nowrap flex-1"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Notification badge (expanded) */}
      {!isCollapsed && notificationBadge && notificationBadge > 0 ? (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={cn(
            'flex-shrink-0 min-w-[20px] h-5 px-1.5',
            'flex items-center justify-center',
            'rounded-full text-[10px] font-bold',
            isActive
              ? 'bg-white/20 text-white'
              : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
          )}
        >
          {notificationBadge > 99 ? '99+' : notificationBadge}
        </motion.span>
      ) : null}
    </Link>
  );
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────

export function Sidebar() {
  const pathname   = usePathname();
  const { user, isAdmin, handleLogout } = useAuth();
  const { unreadCount } = useNotificationStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  const navItems = isAdmin ? ADMIN_NAV : CITIZEN_NAV;

  const isActive = useCallback(
    (href: string) => {
      if (href === '/dashboard' || href === '/admin/dashboard') {
        return pathname === href;
      }
      return pathname.startsWith(href);
    },
    [pathname]
  );

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 240 : 72 }}
      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
      className={cn(
        'hidden lg:flex flex-col',
        'h-screen sticky top-0 z-30',
        'bg-white dark:bg-gray-900',
        'border-r border-gray-100 dark:border-gray-800',
        'overflow-hidden flex-shrink-0'
      )}
    >
      {/* ── Logo Section ── */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-100 dark:border-gray-800 min-h-[72px]">
        <AnimatePresence initial={false} mode="wait">
          {sidebarOpen ? (
            <motion.div
              key="full-logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Logo
                size="sm"
                subtitle={isAdmin ? 'Admin Portal' : 'Citizen Portal'}
              />
            </motion.div>
          ) : (
            <motion.div
              key="icon-logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center mx-auto"
            >
              <MapPin className="w-4 h-4 text-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapse Toggle */}
        {sidebarOpen && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </motion.button>
        )}

        {!sidebarOpen && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={toggleSidebar}
            className="absolute right-2 top-[26px] p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors"
            aria-label="Expand sidebar"
          >
            <motion.div
              animate={{ rotate: 180 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </motion.div>
          </motion.button>
        )}
      </div>

      {/* ── Report Issue CTA ── */}
      <div className={cn('px-3 py-4', !sidebarOpen && 'flex justify-center')}>
        <Link
          href={ROUTES.REPORT}
          className={cn(
            'flex items-center justify-center gap-2',
            'bg-blue-600 hover:bg-blue-700 active:bg-blue-800',
            'text-white font-medium text-sm',
            'transition-all duration-150',
            'shadow-md shadow-blue-500/25',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
            sidebarOpen
              ? 'w-full px-4 py-2.5 rounded-xl'
              : 'w-10 h-10 rounded-xl'
          )}
          title={!sidebarOpen ? 'Report Issue' : undefined}
        >
          <Plus className="w-4 h-4 flex-shrink-0" />
          <AnimatePresence initial={false}>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                Report Issue
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
        {/* Section label */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-widest"
            >
              {isAdmin ? 'Management' : 'Navigation'}
            </motion.p>
          )}
        </AnimatePresence>

        {navItems.map((item) => (
          <SidebarNavItem
            key={item.href}
            item={item}
            isActive={isActive(item.href)}
            isCollapsed={!sidebarOpen}
            notificationBadge={
              item.href === ROUTES.NOTIFICATIONS ? unreadCount : undefined
            }
          />
        ))}
      </nav>

      {/* ── Bottom: User + Logout ── */}
      <div className="border-t border-gray-100 dark:border-gray-800 p-3 space-y-2">
        {/* Priority Stats (expanded only) */}
        <AnimatePresence initial={false}>
          {sidebarOpen && user && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-3 mb-2"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Reputation
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-blue-600">
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
                  transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                {500 - Math.min(user.reputationPoints, 500)} pts to Platinum
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* User info */}
        <div
          className={cn(
            'flex items-center gap-3 p-2 rounded-xl',
            'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
            !sidebarOpen && 'justify-center'
          )}
        >
          <Avatar user={user} size="sm" showBadge />
          <AnimatePresence initial={false}>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex-1 min-w-0 overflow-hidden"
              >
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl w-full',
            'text-sm font-medium text-red-500 dark:text-red-400',
            'hover:bg-red-50 dark:hover:bg-red-900/20',
            'transition-colors',
            !sidebarOpen && 'justify-center'
          )}
          title={!sidebarOpen ? 'Logout' : undefined}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <AnimatePresence initial={false}>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}