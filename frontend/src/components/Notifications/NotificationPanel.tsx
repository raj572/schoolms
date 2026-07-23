import { useState, useEffect } from 'react';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, CheckCircle2, AlertCircle, AlertTriangle, CheckCheck, Trash2, Building2 } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import axios from 'axios';
import { Badge } from '@/components/ui/badge';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface Notice {
  id: number;
  school_id: number;
  title: string;
  content: string;
  type: string;
  priority: string;
  created_at: string;
  school?: {
    id: number;
    name: string;
  };
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'success':
      return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    case 'error':
      return <AlertCircle className="w-5 h-5 text-red-600" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-amber-600" />;
    default:
      return <Bell className="w-5 h-5 text-blue-600" />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'success':
      return 'bg-green-50 border-green-200';
    case 'error':
      return 'bg-red-50 border-red-200';
    case 'warning':
      return 'bg-amber-50 border-amber-200';
    default:
      return 'bg-blue-50 border-blue-200';
  }
};

export const NotificationPanel = () => {
  const { notifications, unreadCount, markAsRead, removeNotification, markAllAsRead, addNotification } = useNotificationStore();
  const { authUser } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [noticesLoaded, setNoticesLoaded] = useState(false);

  // Fetch notices for administrators
  useEffect(() => {
    const fetchNotices = async () => {
      if (authUser?.role === 'administrator' && !noticesLoaded) {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`${API_BASE_URL}/administrator/notices/all`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.data.status && response.data.data) {
            setNotices(response.data.data || []);
            
            // Convert notices to notifications and add to store
            response.data.data.forEach((notice: Notice) => {
              addNotification({
                type: notice.priority === 'urgent' ? 'error' : 'warning',
                title: notice.title,
                message: notice.content,
              });
            });
          }
          setNoticesLoaded(true);
        } catch (error) {
          console.error('Error fetching notices:', error);
        }
      }
    };

    fetchNotices();
  }, [authUser?.role, noticesLoaded, addNotification]);

  const recentNotifications = notifications.slice(0, 10);
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-50 border-red-200';
      case 'high':
        return 'bg-orange-50 border-orange-200';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-xs text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 md:w-96 p-0" align="end">
        <div className="flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="h-8 px-2 text-xs"
                >
                  <CheckCheck className="h-3 w-3 mr-1" />
                  Mark all read
                </Button>
              )}
            </div>
            {unreadCount > 0 && (
              <p className="text-sm text-muted-foreground">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            )}
          </CardHeader>

          <ScrollArea className="h-[400px]">
            <div className="p-2 space-y-2">
              {authUser?.role === 'administrator' && notices.length > 0 && (
                <>
                  <p className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">System Notices</p>
                  {notices.slice(0, 10).map((notice) => (
                    <Card
                      key={`notice-${notice.id}`}
                      className={`cursor-pointer transition-all hover:shadow-md ${getPriorityColor(notice.priority)}`}
                      onClick={() => setIsOpen(false)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-orange-600" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-sm font-semibold text-gray-900 truncate">
                                {notice.title}
                              </h4>
                              <Badge className={getPriorityBadgeColor(notice.priority)}>
                                {notice.priority}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {notice.content}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                              {notice.school?.name && (
                                <>
                                  <Building2 className="h-3 w-3" />
                                  <span>{notice.school.name}</span>
                                </>
                              )}
                              <span>•</span>
                              <span>{new Date(notice.created_at).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}

              {recentNotifications.length > 0 && (
                <>
                  <p className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">Activity</p>
                  {recentNotifications.map((notification) => (
                    <Card
                      key={notification.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        notification.read ? 'opacity-60' : ''
                      } ${getNotificationColor(notification.type)}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-sm font-semibold text-gray-900 truncate">
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <div className="h-2 w-2 rounded-full bg-blue-600 flex-shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-xs text-gray-400">
                                {new Date(notification.timestamp).toLocaleString()}
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeNotification(notification.id);
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}

              {recentNotifications.length === 0 && (authUser?.role !== 'administrator' || notices.length === 0) && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-sm text-gray-500">No notifications</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationPanel;
