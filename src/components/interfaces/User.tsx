export interface User {
    userId: number;
    name: string;
    email: string;
    boardData: UserBoardData;
}

export interface UserBoardData{
    socketId: string;
    mouse:{
        x: number;
        y: number;
    }
}