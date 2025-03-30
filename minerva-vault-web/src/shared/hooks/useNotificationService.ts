import { useNotification } from '../contexts/NotificationContext';

export const useNotificationService = () => {
    const { showNotification } = useNotification();

    return {
        success: (message: string) => showNotification(message, 'success'),
        error: (message: string) => showNotification(message, 'error'),
        warning: (message: string) => showNotification(message, 'warning'),
        info: (message: string) => showNotification(message, 'info')
    };
};