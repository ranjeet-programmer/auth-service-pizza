import { Request } from "express";

export interface UserData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface AuthRequest extends Request {
    auth: {
        sub: string,
        role:number
    }
}