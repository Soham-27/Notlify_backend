import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign } from "hono/jwt";
// import bcrypt from "bcrypt";



export const signup = async (c:any) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
  
    const body = await c.req.json();
    console.log(body);
    
    try {
      // Hash the password using bcrypt
      // const hashedPassword = await bcrypt.hash(body.password, 10); // 10 is the salt rounds, you can adjust this
      
      const user=await prisma.user.create({
        //@ts-ignore
        data:{
          username:body.username,
          fname:body.fname,
          lname:body.lname,
          email:body.email,
          password:body.password,
          bio:body.bio,
          profile_image:body.profile_image
        },
      })
  
      const token = await sign({ id: user.id }, "secret"); // Replace "secret" with your actual secret key
  
      return c.json({
        jwt: token,
      });
    } catch (error: any) {
      console.log(error);
      return c.json({ error: 'Error creating user' }, 500);
    }
  };