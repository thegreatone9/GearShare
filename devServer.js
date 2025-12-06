import express from "express";
import marketplace from "./api/marketplace.js";
import * as dotenv from "dotenv";
import path from 'path';

const envFile = process.env.NODE_ENV === 'development' ? '.env.development' : '.env';
dotenv.config({path: path.resolve(process.cwd(), envFile)});

const APP_MODE = process.env.NODE_ENV;

const app = express();
app.use(express.json());

app.get("/api/marketplace", marketplace);

app.listen(PORT, () => console.log(`Server listening at ${window.location.host}, in '${APP_MODE}' mode.`));