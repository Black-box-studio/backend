import ErrorHandeler from "../utils/ErrorHandler";
import { NextFunction, Request, Response } from "express";

export const ErrorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    //Wrong Mongodb Id Error
    if (err.name === "CastError") {
        const message = `Resource not found. Invalid: ${err.path}`;
        err = new ErrorHandeler(message, 400);
    }

    //Mongoose duplicate key error
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
        err = new ErrorHandeler(message, 400);
    }

    //Wrong JWT Error
    if (err.name === "JsonWebTokenError") {
        const message = `Json Web Token is invalid. Try again`;
        err = new ErrorHandeler(message, 400);
    }

    //JWT Expire Error
    if (err.name === "TokenExpiredError") {
        const message = `Json Web Token is Expired. Try again`;
        err = new ErrorHandeler(message, 400);
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message
    });

}