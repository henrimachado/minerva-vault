import { AlertColor } from '@mui/material';

type NotificationCallback = (message: string, severity: AlertColor) => void;

class NotificationService {
    private static instance: NotificationService;
    private notificationCallback: NotificationCallback | null = null;

    private constructor() { }

    public static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    public setNotificationCallback(callback: NotificationCallback): void {
        this.notificationCallback = callback;
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
        if (this.notificationCallback) {
            this.notificationCallback(message, severity);
        } else {
            console.warn('Notification callback not set');
        }
    }
}

export default NotificationService.getInstance();