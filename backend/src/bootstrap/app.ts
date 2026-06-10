import dotenv from "dotenv";
dotenv.config();
import express from "express";
import http from 'http';
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import morgan from "morgan";
import { makeContainer } from './dic';

import routes from "../routes/router";


export const container = makeContainer();
export const app       = express();

app.use(cors());
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests, please try again later.",
}));
app.disable('x-powered-by');
app.use(express.json());
app.use(morgan("dev"));
app.use(helmet());

app.use((req: any, _res, next) => {
    req.container = container.createScope();
    next();
});


app.use("/api", routes);

export default app;