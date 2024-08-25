import { Hono } from "hono";
import { getUser, login, signup } from "../controllers/userControllers";
import { isAuth } from "../middleware/usermiddleware";
export const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: string;
  };
}>();
userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.use("/*", isAuth);
userRouter.get("/", isAuth, getUser);
