import { Hono } from 'hono'
import { userRouter } from './routes/userRoutes';
import bcrypt from "bcrypt";

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  }
}>();
app.route("/user",userRouter);

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

export default app
