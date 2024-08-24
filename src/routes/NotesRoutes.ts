import { Hono } from "hono";
import { login, signup } from "../controllers/userControllers";
import { isAuth } from "../middleware/usermiddleware";
import { createNote, deleteNote, getNotes, updateNote } from "../controllers/notesController";
export const noteRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    },
    Variables: {
        user_id: string;
    }
}>();
noteRouter.use('/*', isAuth);
noteRouter.post("/create",createNote);
noteRouter.get("/get/getnotes",getNotes);
noteRouter.delete("/delete/:id",isAuth,deleteNote);
noteRouter.put("/update/:id",isAuth,updateNote);
 