import { Hono } from "hono";
import { login, signup } from "../controllers/userControllers";
import { isAuth } from "../middleware/usermiddleware";
import { createNote, getNotes } from "../controllers/notesController";
export const noteRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    }
}>();
noteRouter.use('/protected/*', isAuth);

noteRouter.post("/create",createNote);
noteRouter.get("/protected/getnotes",getNotes);
 