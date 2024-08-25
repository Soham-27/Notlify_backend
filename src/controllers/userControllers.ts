import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign } from "hono/jwt";
// import bcrypt from "bcrypt";

async function hashPassword(password: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);

  // Using SHA-256 to hash the password
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  // Convert the ArrayBuffer to a hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hashHex;
}

export const signup = async (c: any) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();
  console.log(body);

  try {
    // Hash the password using bcrypt
    const hashpassword = await hashPassword(body.password); // 10 is the salt rounds, you can adjust this
    console.log(hashpassword);
    const user = await prisma.user.create({
      //@ts-ignore
      data: {
        fname: body.fname,
        lname: body.lname,
        email: body.email,
        password: hashpassword,
      },
    });

    const token = await sign({ id: user.id }, "secret"); // Replace "secret" with your actual secret key

    return c.json({
      jwt: token,
      message: "user registered succcessfully !!",
    });
  } catch (error: any) {
    console.log(error);
    return c.json({ error: "Error creating user" }, 500);
  }
};

export const login = async (c: any) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const body = await c.req.json();
  console.log(body);
  try {
    const email = body.email;
    const password = body.password;
    if (!email && !password) {
      return c.json({ message: "please fill the required fields !!" });
    }
    const user = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });
    if (!user) {
      return c.json({ message: "email can not found" });
    }
    const hashedpassword = await hashPassword(password);
    if (user.password === hashedpassword) {
      const token = await sign({ id: user.id }, "secret");
      return c.json({ jwt: token, message: "user logged in successfully !!!" });
    }
    return c.json({ message: "enter correct password" });
  } catch (error: any) {
    console.log(error);
    return c.json({ error: "Error logging user" }, 500);
  }
};

export const getUser = async (c: any) => {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: c.env.DATABASE_URL,
      },
    },
  }).$extends(withAccelerate());

  const user = c.get("user_id");
  if (!user) {
    return c.json({ message: "user is missing" }, 400);
  }

  try {
    // Check if the note exists before deleting
    const User = await prisma.user.findUnique({
      where: {
        id: Number(user.id),
      },
    });

    if (!User) {
      return c.json({ message: "user not found" }, 404);
    }

    return c.json(User);
  } catch (error: any) {
    console.error("Error  :", error);
    return c.json({ message: "Failed to get user", error }, 500);
  }
};
