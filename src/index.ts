import { Hono } from "hono";
import { userRouter } from "./routes/userRoutes";
import { noteRouter } from "./routes/NotesRoutes";

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

// CORS middleware
app.use("*", async (c, next) => {
  c.res.headers.append("Access-Control-Allow-Origin", "*");
  c.res.headers.append(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  c.res.headers.append(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  if (c.req.method === "OPTIONS") {
    return c.text("Preflight request allowed", 200);
  }
  await next();
});

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
