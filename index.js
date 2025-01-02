import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./routers/auth.router.js";
import userRouter from "./routers/user.router.js";
import healthyServicesRouter from "./routers/healthy-services.router.js";


import connectDB from "./configs/db.config.js";

dotenv.config();

connectDB();

const app = express();
console.log(process.env.URL,'process.env.URL');

app.use(
  cors({
    origin: process.env.URL,
    credentials: true,
    methods: "*",
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/auth", authRouter);
app.use("/", userRouter);
app.use("/healthsy-services", healthyServicesRouter);




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});