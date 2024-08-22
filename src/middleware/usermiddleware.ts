import { Hono } from 'hono';
import { verify } from 'hono/jwt';


// export const isAuth = async (c: any, next:()=> Promise<void>) => {
//     try {
//         // Log the entire headers object to ensure it is accessible
//         console.log('Headers:', c.req.headers);

//         // Retrieve and log the Authorization header
//         const authHeader =   c.req.header('Authorization');
//         console.log('Auth Header:', authHeader);

//         if (!authHeader) {
//             return c.json({ message: 'Authorization header is missing' }, 401);
//         }

//         // Ensure the header starts with 'Bearer ' and extract the token
//         if (!authHeader.startsWith('Bearer ')) {
//             return c.json({ message: 'Authorization header must start with Bearer ' }, 401);
//         }

//         const token = authHeader.split(' ')[1];
//         console.log('Token:', token);
//         if(token){
//             const  payload = await verify(token, "secret");
//         //@ts-ignore
//             console.log('Payload:', payload.id);

//         // Attach the user data from the token to the context
//             c.req.user = payload.id;
    
//         // Continue to the next handler
//             await next();
//         }
//         else{
//             return c.json({ message: 'Token is missing' }, 401);
//         }
  
//         // Verify JWT token
//         //@ts-ignore
        
//     } catch (error) {
//         console.error('JWT verification failed:', error);
//         return c.json({ message: 'Invalid or expired token' }, 401);
//     }
// };
                  


export const isAuth = async (c: any, next: () => Promise<void>) => {
    try {
        // Log the entire headers object to ensure it is accessible
        console.log('Headers:', c.req.headers);

        // Retrieve and log the Authorization header
        const authHeader = c.req.header('authorization') || '';
        console.log('Auth Header:', authHeader);

        if (!authHeader) {
            return c.json({ message: 'Authorization header is missing' }, 401);
        }

        // Ensure the header starts with 'Bearer ' and extract the token
        if (!authHeader.startsWith('Bearer ')) {
            return c.json({ message: 'Authorization header must start with Bearer ' }, 401);
        }

        const token = authHeader.split(' ')[1];
        console.log('Token:', token);

        if (!token) {
            return c.json({ message: 'Token is missing' }, 401);
        }

        // Verify JWT token
        const payload = await verify(token, "secret");
        console.log('Payload:', payload);

        // Attach the user data from the token to the context
        c.req.user = payload.id;

        // Continue to the next handler
        await next();
    } catch (error) {
        console.error('JWT verification failed:', error);
        return c.json({ message: 'Invalid or expired token' }, 401);
    }
};