require("dotenv").config();
import { Response } from "express";
import { IUser } from "../models/user.model";
import { redis } from "./redis";

interface ITokenOptions {
    expires: Date;
    maxAge: number;
    httpOnly: boolean;
    sameSite: 'lax' | 'strict' | 'none' | undefined;
    secure?: boolean;
}

export const sendToken = (
    user: IUser,
    statusCode: number,
    res: Response
) => {
    const accessToken = user.SignAccessToken();

    const refreshToken = user.SignRefreshToken();
    // upload session to redis
    redis.set(user._id, JSON.stringify(user) as any);

    //parse environment variables to integrate with fallback values
    const accessTokenExpires = parseInt(process.env.ACCESS_TOKEN_EXPIRES || '300', 10);
    const refreshTokenExpires = parseInt(process.env.REFRESH_TOKEN_EXPIRES || '1200', 10);

    // options for cookie
    const accessTokenOptions: ITokenOptions = {
        expires: new Date(Date.now() + accessTokenExpires * 1000),
        maxAge: accessTokenExpires * 1000,
        httpOnly: true,
        sameSite: 'lax',
    };

    const refreshTokenOptions: ITokenOptions = {
        expires: new Date(Date.now() + refreshTokenExpires * 1000),
        maxAge: refreshTokenExpires * 1000,
        httpOnly: true,
        sameSite: 'lax',
    };

    //only set Secure to true in production
    if (process.env.NODE_ENV === 'production') {
        accessTokenOptions.secure = true;
        // refreshTokenOptions.secure = true;
    }

    res.cookie('access_token', accessToken, accessTokenOptions);
    res.cookie('refresh_token', refreshToken, refreshTokenOptions);

    res.status(statusCode).json({
        success: true,
        user,
        accessToken
    });
}


// https://www.youtube.com/watch?v=NdpF5RZTh7E&