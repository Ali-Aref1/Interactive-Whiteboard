export interface User {
    userId: number;
    username: string;
    email: string;
    avatarUrl?: string;
    socketId?: string;
    mouse?:{
        x: number;
        y: number;
    }
    prefColor?: string;
}