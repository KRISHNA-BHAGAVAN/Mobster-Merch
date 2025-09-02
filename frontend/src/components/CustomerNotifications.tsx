import React, { useState, useEffect } from 'react';
import { Card, CardBody, Button, Chip } from "@heroui/react";
import { Icon } from '@iconify/react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { orderService } from '../services/orderService';

interface Notification {
  notification_id: number;
  type: string;
  title: string;
  message: string;
  order_id?: string;
  is_read: boolean;
  created_at: string;
}

export const CustomerNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const data = await orderService.getCustomerNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await orderService.markCustomerNotificationRead(notificationId);
      fetchNotifications();
      showToast('Notification marked as read', 'success');
    } catch (error) {
      showToast('Error marking notification as read', 'error');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'admin_message': return 'primary';
      case 'order_update': return 'success';
      case 'refund_request': return 'warning';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icon icon="lucide:loader-2" className="animate-spin h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="heading-font text-3xl">My Notifications</h1>
          <Button variant="flat" onPress={() => navigate('/')}>
            Back to Home
          </Button>
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-20">
            <Icon icon="lucide:bell" className="h-16 w-16 text-foreground/50 mx-auto mb-4" />
            <p className="text-foreground/70 mb-4">No notifications</p>
            <Button color="primary" onPress={() => navigate('/products')}>
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map(notification => (
              <Card key={notification.notification_id} className={!notification.is_read ? 'border-primary' : ''}>
                <CardBody>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="heading-font text-lg flex items-center gap-2">
                        {notification.title}
                        {!notification.is_read && (
                          <span className="w-2 h-2 bg-primary rounded-full"></span>
                        )}
                      </h3>
                      <p className="text-sm text-foreground/70">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Chip color={getTypeColor(notification.type)} variant="flat" size="sm">
                        {notification.type === 'admin_message' ? 'MESSAGE' : 
                         notification.type === 'order_update' ? 'ORDER UPDATE' : 
                         'REFUND REQUEST'}
                      </Chip>
                    </div>
                  </div>
                  
                  <p className="mb-4">{notification.message}</p>
                  
                  {notification.order_id && (
                    <p className="text-sm text-foreground/60 mb-4">
                      <strong>Order ID:</strong> {notification.order_id}
                    </p>
                  )}
                  
                  {!notification.is_read && (
                    <Button 
                      size="sm"
                      color="primary"
                      variant="flat"
                      onPress={() => markAsRead(notification.notification_id)}
                      startContent={<Icon icon="lucide:check" />}
                    >
                      Mark as Read
                    </Button>
                  )}
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};