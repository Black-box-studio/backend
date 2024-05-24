require("dotenv").config();
import express, { Request, Response, NextFunction } from "express";
export const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";
import { ErrorMiddleware } from "./middleware/error";
import userRouter from "./routes/user.route";


//body parser
app.use(express.json({limit:"50mb"}));
// app.use(express.urlencoded());

//cookie parser
app.use(cookieParser());

//cors => allow cross origin resource sharing
app.use(
    cors({
        origin: process.env.ORIGIN,
    })
);

//import routes

app.use("/api/v1",userRouter);

//testing api
app.get("/BlackBoys", (req:Request, res:Response, next:NextFunction) => {
    res.status(200).json({
        success:true,
        message:"Api Working",
    });
});


//unknown route
app.all("*",(req:Request, res:Response, next:NextFunction) => {
    const err = new Error(`Route ${req.originalUrl} Not Found`) as any;
    err.statusCode = 404;
    next(err);
});


//error middleware
app.use(ErrorMiddleware);