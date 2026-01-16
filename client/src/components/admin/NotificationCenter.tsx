import { useNotifications } from '@/contexts/NotificationContext';
import { Bell, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const NOTIFICATION_ICONS = {
  import_success: '✅',
  import_fail: '❌',
  seo_gate_fail: '⚠️',
  missing_images: '🖼️',
  deploy_fail: '🚨',
  indexing_error: '🔍',
  info: 'ℹ️',
};

const NOTIFICATION_COLORS = {
  import_success: 'text-green-600',
  import_fail: 'text-red-600',
  seo_gate_fail: 'text-yellow-600',
  missing_images: 'text-blue-600',
  deploy_fail: 'text-red-700',
  indexing_error: 'text-orange-600',
  info: 'text-gray-600',
};

export function NotificationCenter() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification } = useNotifications();

  // Show last 20 notifications
  const recentNotifications = notifications.slice(0, 20);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 max-h-[500px] overflow-y-auto">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={markAllAsRead}
            >
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {recentNotifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            No notifications
          </div>
        ) : (
          recentNotifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={cn(
                'flex items-start gap-3 p-3 cursor-pointer',
                !notification.read && 'bg-blue-50'
              )}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="text-2xl flex-shrink-0">
                {NOTIFICATION_ICONS[notification.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className={cn(
                    'text-sm font-medium',
                    NOTIFICATION_COLORS[notification.type]
                  )}>
                    {notification.title}
                  </h4>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearNotification(notification.id);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                  {notification.message}
                </p>
                <span className="text-xs text-gray-400 mt-1 block">
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </span>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
