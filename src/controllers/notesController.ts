import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from "@prisma/extension-accelerate";
import { Context } from 'hono';

export const createNote = async (c:Context) => {
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
        const user = c.get("user_id"); // Assume user_id is attached by authentication middleware

        console.log(body);

        try {
            // Validate the request body
            if (!body.title) {
                return c.json({ message: 'Please enter a title for your note' }, 400);
            }

            // Create a new note in the database    
            
            const note = await prisma.notes.create({
                data: {
                    title: body.title,
                    content: body.content || '', // Default to empty string if content is not provided
                    created_at: new Date(),
                    updated_at:new Date(), // Use Date object for current timestamp
                    authorId:user.id,
                },
            });

            // Return the created note or a success message
            return c.json({ message: 'Note created successfully', note }, 201);
        } catch (error) {
            console.error('Error creating note:', error);
            //@ts-ignore
            return c.json({ message: 'Failed to create note', error: error.message }, 500);
        }
};



export const getNotes = async (c: Context) => {
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: c.env.DATABASE_URL,
            },
        },
    }).$extends(withAccelerate());

    const user = c.get("user_id");
    if (!user) {
        return c.json({ message: "Unauthorized" }, 401);
    }

    try {
        const notes = await prisma.notes.findMany({
            where: {
                authorId: user.id, // Assuming user has an `id` property
            },
        });

        // Return the notes in the response
        return c.json(notes);
    } catch (error) {
        console.error('Error getting note:', error);
        return c.json({ message: 'Failed to get notes',  error }, 500);
    }
}


export const deleteNote = async (c: Context) => {
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: c.env.DATABASE_URL,
            },
        },
    }).$extends(withAccelerate());
    const note_id = c.req.param("id");

    if (!note_id) {
        return c.json({ message: "Note ID is missing" }, 400);
    }

    try {
        // Check if the note exists before deleting
        const existingNote = await prisma.notes.findUnique({
            where: {
                id: Number(note_id),
            },
        });

        if (!existingNote) {
            return c.json({ message: "Note not found" }, 404);
        }

        // Delete the note if it exists
        await prisma.notes.delete({
            where: {
                id: Number(note_id),
            },
        });

        return c.json({ message: "Note deleted successfully!" });
    } catch (error) {
        console.error('Error deleting note:', error);
        return c.json({ message: 'Failed to delete note', error }, 500);
    }
};

export const updateNote = async (c: Context) => {
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: c.env.DATABASE_URL,
            },
        },
    }).$extends(withAccelerate());
    const note_id = c.req.param("id");
    const { title, content } = await c.req.json(); // Assuming the updated note data is sent in the request body

    if (!note_id) {
        return c.json({ message: "Note ID is missing" }, 400);
    }

    if (!title && !content) {
        return c.json({ message: "No content provided for update" }, 400);
    }

    try {
        // Check if the note exists before updating
        const existingNote = await prisma.notes.findUnique({
            where: {
                id: Number(note_id),
            },
        });

        if (!existingNote) {
            return c.json({ message: "Note not found" }, 404);
        }

        // Update the note with the new data
        const updatedNote = await prisma.notes.update({
            where: {
                id: Number(note_id),
            },
            data: {
                title: title ?? existingNote.title, // Keep old title if new one isn't provided
                content: content ?? existingNote.content, // Keep old content if new one isn't provided
            },
        });

        return c.json({ message: "Note updated successfully!", note: updatedNote });
    } catch (error) {
        console.error('Error updating note:', error);
        return c.json({ message: 'Failed to update note', error }, 500);
    }
};