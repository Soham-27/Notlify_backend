import { Hono } from "hono";
import { userRouter } from "./routes/userRoutes";
import { noteRouter } from "./routes/NotesRoutes";
import { cors } from "hono/cors";
const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

// CORS middleware

app.use("/*", cors());
// Add routes
app.route("/user", userRouter);
app.route("/note", noteRouter);

// Basic route
app.get("/", (c) => {
  return c.text("Iam Alive");
});

// Global error handler
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Internal Server Error" }, 500);
});

export default app;
