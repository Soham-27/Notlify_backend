import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from "@prisma/extension-accelerate";


export const createNote = async (c: any) => {
        // Initialize Prisma Client with environment variable for database URL
        const prisma = new PrismaClient({
            datasources: {
                db: {
                    url: c.env.DATABASE_URL,
                },
            },
        }).$extends(withAccelerate());

        // Parse the request body
        const body = await c.req.json();
        const user_id = c.req.user; // Assume user_id is attached by authentication middleware

        console.log(body);

        try {
            // Validate the request body
            if (!body.title) {
                return c.json({ message: 'Please enter a title for your note' }, 400);
            }

            // Create a new note in the database
            
            const note = await prisma.notes.create({
                //@ts-ignore
                data: {
                    title: body.title,
                    content: body.content || '', // Default to empty string if content is not provided
                    created_at: new Date(),
                    updated_at:new Date(), // Use Date object for current timestamp
                    authorId: user_id,
                },
            });

            // Return the created note or a success message
            return c.json({ message: 'Note created successfully', note }, 201);
        } catch (error) {
            console.error('Error creating note:', error);
            return c.json({ message: 'Failed to create note', error: error.message }, 500);
        }
};



export const getNotes=async(c:any)=>{
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: c.env.DATABASE_URL,
            },
        },
    }).$extends(withAccelerate());
    const user_id =await c.req.user;
    try {
        const notes = await prisma.notes.findMany({
            where: {
                authorId: user_id,
            },
        });

        // Return the notes in the response
        c.json(notes);
    } catch (error) {
        console.error('Error getting note:', error);
        return c.json({ message: 'Failed to getting note', error: error.message }, 500);
    }

}