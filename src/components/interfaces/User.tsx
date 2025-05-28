export interface User {
    userId: number;
    username: string;
    email: string;
    boardData?: UserBoardData;
}

export interface UserBoardData{
    socketId: string;
    mouse:{
        x: number;
        y: number;
    }
}