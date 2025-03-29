// src/shared/contexts/NotificationContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Snackbar, Alert, AlertColor, Box } from '@mui/material';

interface NotificationItem {
    id: number;
    message: string;
    severity: AlertColor;
    open: boolean;
}

interface NotificationContextProps {
    showNotification: (message: string, severity?: AlertColor) => void;
}

interface NotificationProviderProps {
    children: ReactNode;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

// Hook para usar o contexto
export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

// Singleton para acesso global
class NotificationServiceSingleton {
    private static instance: NotificationServiceSingleton;
    private showNotificationFn: ((message: string, severity: AlertColor) => void) | null = null;

    private constructor() { }

    public static getInstance(): NotificationServiceSingleton {
        if (!NotificationServiceSingleton.instance) {
            NotificationServiceSingleton.instance = new NotificationServiceSingleton();
        }
        return NotificationServiceSingleton.instance;
    }

    public setShowNotification(fn: (message: string, severity: AlertColor) => void): void {
        this.showNotificationFn = fn;
    }

    public success(message: string): void {
        this.notify(message, 'success');
    }

    public error(message: string): void {
        this.notify(message, 'error');
    }

    public warning(message: string): void {
        this.notify(message, 'warning');
    }

    public info(message: string): void {
        this.notify(message, 'info');
    }

    private notify(message: string, severity: AlertColor): void {
        if (this.showNotificationFn) {
            this.showNotificationFn(message, severity);
        } else {
            console.warn('Notification function not set');
        }
    }
}

// Exportando a instância singleton
export const NotificationService = NotificationServiceSingleton.getInstance();

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    let nextId = 0;

    const showNotification = (message: string, severity: AlertColor = 'info') => {
        const id = nextId++;
        setNotifications(prev => [
            ...prev,
            {
                id,
                message,
                severity,
                open: true
            }
        ]);

        // Auto-remove notification after 6 seconds
        setTimeout(() => {
            handleClose(id);
        }, 6000);
    };

    const handleClose = (id: number) => {
        setNotifications(prev =>
            prev.map(notification =>
                notification.id === id
                    ? { ...notification, open: false }
                    : notification
            )
        );

        // Remove from DOM after animation completes
        setTimeout(() => {
            setNotifications(prev => prev.filter(notification => notification.id !== id));
        }, 500);
    };

    // Importante: Registrar a função showNotification no serviço singleton
    useEffect(() => {
        NotificationService.setShowNotification(showNotification);

        // Para debug
        console.log('NotificationProvider mounted and registered showNotification');

        return () => {
            // Para debug
            console.log('NotificationProvider unmounted');
        };
    }, []);

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <Box
                sx={{
                    position: 'fixed',
                    bottom: 16,
                    right: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    zIndex: 9999, // Valor alto para garantir que fique acima de tudo
                }}
            >
                {notifications.map((notification) => (
                    <Snackbar
                        key={notification.id}
                        open={notification.open}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        sx={{
                            position: 'static',
                            mb: 1,
                            transition: 'opacity 0.5s, transform 0.5s',
                            opacity: notification.open ? 1 : 0,
                            transform: notification.open ? 'translateX(0)' : 'translateX(100%)',
                        }}
                    >
                        <Alert
                            onClose={() => handleClose(notification.id)}
                            severity={notification.severity}
                            variant="filled"
                            elevation={6}
                            sx={{ width: '100%', minWidth: '250px' }}
                        >
                            {notification.message}
                        </Alert>
                    </Snackbar>
                ))}
            </Box>
        </NotificationContext.Provider>
    );
};