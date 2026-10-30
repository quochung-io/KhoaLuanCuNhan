import { HubConnection, HubConnectionBuilder, LogLevel, HubConnectionState } from '@microsoft/signalr';

const getHubUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5023/api';
  return apiUrl.replace(/\/api\/?$/, '') + '/hubs/notifications';
};

class SignalRService {
  private connection: HubConnection | null = null;
  private isStarting = false;

  public getConnection(): HubConnection {
    if (!this.connection) {
      this.connection = new HubConnectionBuilder()
        .withUrl(getHubUrl(), {
          accessTokenFactory: () => {
            return localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
          },
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .configureLogging(LogLevel.Warning)
        .build();

      this.connection.onreconnecting((error) => {
        console.warn('[SignalR] Đang thử kết nối lại...', error);
      });

      this.connection.onreconnected((connectionId) => {
        console.log('[SignalR] Đã kết nối lại thành công. ConnectionId:', connectionId);
      });

      this.connection.onclose((error) => {
        console.warn('[SignalR] Kết nối đã đóng:', error);
      });
    }

    return this.connection;
  }

  public async start(): Promise<void> {
    const conn = this.getConnection();
    if (conn.state === HubConnectionState.Connected || this.isStarting) {
      return;
    }

    try {
      this.isStarting = true;
      await conn.start();
      console.log('[SignalR] Kết nối Realtime Notifications thành công!');
    } catch (err) {
      console.error('[SignalR] Lỗi khi kết nối SignalR Hub:', err);
    } finally {
      this.isStarting = false;
    }
  }

  public async stop(): Promise<void> {
    if (this.connection && this.connection.state === HubConnectionState.Connected) {
      await this.connection.stop();
      console.log('[SignalR] Đã ngắt kết nối.');
    }
  }

  public onOrderCreated(callback: (data: any) => void): () => void {
    const conn = this.getConnection();
    conn.on('OrderCreated', callback);
    return () => conn.off('OrderCreated', callback);
  }

  public onOrderStatusChanged(callback: (data: any) => void): () => void {
    const conn = this.getConnection();
    conn.on('OrderStatusChanged', callback);
    return () => conn.off('OrderStatusChanged', callback);
  }
}

export const signalRService = new SignalRService();
export default signalRService;
