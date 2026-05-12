'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Menu,
  Plus,
  X,
  LogOut,
  User,
  Settings,
  ChevronDown,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn, timeAgo } from '@/lib/utils';
import { Avatar } from '@/components/shared/Avatar';
import { Logo } from '@/components/shared/Logo';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationStore } from '@/store/notificationStore';
import { useUIStore } from '@/store/uiStore';
import { useSocket } from '@/hooks/useSocket';
import { useClickOutside } from '@/hooks/useClickOutside';
import { ROUTES } from '@/lib/constants';
import { useDebouncedSearch } from '@/hooks/useDebounce';
import { useIssueStore } from '@/store/issueStore';

// ─── Notification Dropdown ─────────────────────────────────────────────────

function NotificationDropdown({ onClose }: { onClose: () => void }) {
  const {
  notifications,
  unreadCount,
  markAllAsRead: handleMarkAllAsRead,
  } = useNotificationStore() as any;
  const { markAllAsRead } = useNotificationStore();
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className={cn(
        'absolute right-0 top-full mt-2 w-80 z-50',
        'bg-white dark:bg-gray-800 rounded-2xl',
        'border border-gray-100 dark:border-gray-700',
        'shadow-xl shadow-black/10',
        'overflow-hidden'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900 dark:text-white text-sm">
            Notifications
          </span>
          {unreadCount > 0 && (
            <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-72 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-700">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
            <Bell className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          notifications.slice(0, 5).map((n: any) => (
            <div
              key={n._id}
              className={cn(
                'flex items-start gap-3 px-4 py-3 cursor-pointer',
                'hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors',
                !n.isRead && 'bg-blue-50/50 dark:bg-blue-900/10'
              )}
              onClick={() => {
                router.push(ROUTES.NOTIFICATIONS);
                onClose();
              }}
            >
              {!n.isRead && (
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
              )}
              <div className={cn('flex-1 min-w-0', n.isRead && 'pl-5')}>
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {n.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                  {n.message}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {timeAgo(n.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700">
        <Link
          href={ROUTES.NOTIFICATIONS}
          onClick={onClose}
          className="block text-center text-sm text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700"
        >
          View all notifications →
        </Link>
      </div>
    </motion.div>
  );
}

// ─── User Menu ────────────────────────────────────────────────────────────

function UserMenu({ onClose }: { onClose: () => void }) {
  const { user, handleLogout } = useAuth();
  const router = useRouter();

  const items = [
    { label: 'My Profile', icon: User, href: ROUTES.PROFILE },
    { label: 'My Reports', icon: Settings, href: ROUTES.MY_REPORTS },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className={cn(
        'absolute right-0 top-full mt-2 w-56 z-50',
        'bg-white dark:bg-gray-800 rounded-2xl',
        'border border-gray-100 dark:border-gray-700',
        'shadow-xl shadow-black/10 overflow-hidden'
      )}
    >
      {/* User info */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
          {user?.name}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {user?.email}
        </p>
        <span
          className={cn(
            'inline-flex items-center mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold',
            user?.role === 'admin' || user?.role === 'super_admin'
              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
          )}
        >
          {user?.role === 'super_admin'
            ? 'Super Admin'
            : user?.role === 'admin'
            ? 'Admin'
            : 'Citizen'}
        </span>
      </div>

      {/* Menu items */}
      <div className="py-1">
        {items.map((item) => (
          <button
            key={item.href}
            onClick={() => {
              router.push(item.href);
              onClose();
            }}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <item.icon className="w-4 h-4 text-gray-400" />
            {item.label}
          </button>
        ))}
      </div>

      <div className="border-t border-gray-100 dark:border-gray-700 py-1">
        <button
          onClick={() => {
            handleLogout();
            onClose();
          }}
          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </motion.div>
  );
}

// ─── Search Bar ───────────────────────────────────────────────────────────

function SearchBar() {
  const [focused, setFocused] = useState(false);
  const { setFilters, fetchIssues } = useIssueStore();
  const router = useRouter();

  const { searchValue, handleSearch, clearSearch } = useDebouncedSearch(
    (value) => {
      if (value) {
        setFilters({ search: value });
        router.push(ROUTES.ISSUES);
      }
    },
    400
  );

  return (
    <div className={cn('relative hidden md:block transition-all duration-300', focused ? 'w-72' : 'w-52')}>
      <div className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-xl',
        'bg-gray-100 dark:bg-gray-800',
        'border transition-all duration-150',
        focused
          ? 'border-blue-400 bg-white dark:bg-gray-700 shadow-sm shadow-blue-500/10'
          : 'border-transparent'
      )}>
        <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search issues..."
          className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-200 placeholder:text-gray-400 outline-none min-w-0"
        />
        {searchValue && (
          <button onClick={clearSearch} className="text-gray-400 hover:text-gray-600">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main TopBar ──────────────────────────────────────────────────────────

export function TopBar() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const { user, isAdmin } = useAuth();
  const { unreadCount } = useNotificationStore();
  const { setMobileDrawerOpen } = useUIStore();

  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const notifRef = useClickOutside<HTMLDivElement>(() => setNotifOpen(false), notifOpen);
  const userMenuRef = useClickOutside<HTMLDivElement>(() => setUserMenuOpen(false), userMenuOpen);

  const { isConnected } = useSocket();

  // Get current page title
  const getPageTitle = () => {
    const map: Record<string, string> = {
      '/dashboard': 'Dashboard',
      '/issues': 'Issue Feed',
      '/report': 'Report an Issue',
      '/map': 'Map View',
      '/my-reports': 'My Reports',
      '/notifications': 'Notifications',
      '/profile': 'Profile',
      '/admin/dashboard': 'Admin Dashboard',
      '/admin/issues': 'Issue Moderation',
      '/admin/analytics': 'Analytics',
      '/admin/users': 'User Management',
    };
    return map[pathname] || 'Voice2Action';
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-20 h-16',
        'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md',
        'border-b border-gray-100 dark:border-gray-800',
        'flex items-center px-4 gap-4'
      )}
    >
      {/* Mobile: Hamburger + Logo */}
      <div className="flex items-center gap-3 lg:hidden">
        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Logo size="sm" />
      </div>

      {/* Desktop: Page title */}
      <div className="hidden lg:flex items-center gap-2 flex-1 min-w-0">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white truncate">
          {getPageTitle()}
        </h2>
        {/* Live connection indicator */}
        <div
          className={cn(
            'flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium',
            isConnected
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500'
          )}
          title={isConnected ? 'Live updates active' : 'Reconnecting...'}
        >
          {isConnected ? (
            <Wifi className="w-3 h-3" />
          ) : (
            <WifiOff className="w-3 h-3" />
          )}
          <span>{isConnected ? 'Live' : 'Offline'}</span>
        </div>
      </div>

      {/* Search */}
      <SearchBar />

      {/* Right Actions */}
      <div className="flex items-center gap-2 ml-auto lg:ml-0">

        {/* Report Issue (mobile) */}
        <Link
          href={ROUTES.REPORT}
          className="lg:hidden flex items-center justify-center w-9 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
          aria-label="Report Issue"
        >
          <Plus className="w-4 h-4" />
        </Link>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
          aria-label="Toggle theme"
        >
          <AnimatePresence mode="wait" initial={false}>
            {resolvedTheme === 'dark' ? (
              <motion.div
                key="sun"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Sun className="w-4 h-4" />
              </motion.div>
            ) : (
              <motion.div
                key="moon"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Moon className="w-4 h-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => {
              setNotifOpen((prev) => !prev);
              setUserMenuOpen(false);
            }}
            className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
            aria-label={`${unreadCount} notifications`}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="notification-dot"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <NotificationDropdown onClose={() => setNotifOpen(false)} />
            )}
          </AnimatePresence>
        </div>

        {/* User Menu */}
        <div ref={userMenuRef} className="relative">
          <button
            onClick={() => {
              setUserMenuOpen((prev) => !prev);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Avatar user={user} size="sm" showBadge />
            <ChevronDown
              className={cn(
                'w-3.5 h-3.5 text-gray-400 hidden sm:block transition-transform duration-200',
                userMenuOpen && 'rotate-180'
              )}
            />
          </button>

          <AnimatePresence>
            {userMenuOpen && (
              <UserMenu onClose={() => setUserMenuOpen(false)} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}