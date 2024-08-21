import { Hono } from "hono";
import { login, signup } from "../controllers/userControllers";
export const userRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    }
}>();
userRouter.post("/signup",signup);
userRouter.post("/login",login);
