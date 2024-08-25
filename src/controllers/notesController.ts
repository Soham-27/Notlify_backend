import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Context } from "hono";

export const createNote = async (c: Context) => {
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
      return c.json({ message: "Please enter a title for your note" }, 400);
    }

    // Create a new note in the database

    const note = await prisma.notes.create({
      data: {
        title: body.title,
        content: body.content || "", // Default to empty string if content is not provided
        created_at: new Date(),
        updated_at: new Date(), // Use Date object for current timestamp
        authorId: user.id,
      },
    });

    // Return the created note or a success message
    return c.json({ message: "Note created successfully", note }, 201);
  } catch (error: any) {
    console.error("Error creating note:", error);
    //@ts-ignore
    return c.json(
      { message: "Failed to create note", error: error.message },
      500
    );
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
    console.error("Error getting note:", error);
    return c.json({ message: "Failed to get notes", error }, 500);
  }
};

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
    console.error("Error deleting note:", error);
    return c.json({ message: "Failed to delete note", error }, 500);
  }
};

export const getSingle = async (c: Context) => {
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
    const note = await prisma.notes.findUnique({
      where: {
        id: Number(note_id),
      },
    });

    if (!note) {
      return c.json({ message: "Note not found" }, 404);
    }

    return c.json(note);
  } catch (error) {
    console.error("Error deleting note:", error);
    return c.json({ message: "Failed to delete note", error }, 500);
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
  let title, content;

  // Safely parse the JSON body
  try {
    const body = await c.req.json();
    title = body.title;
    content = body.content;
  } catch (error) {
    return c.json({ message: "Invalid JSON body" }, 400);
  }

  if (!note_id) {
    return c.json({ message: "Note ID is missing" }, 400);
  }

  try {
    const existingNote = await prisma.notes.findUnique({
      where: {
        id: Number(note_id),
      },
    });

    if (!existingNote) {
      return c.json({ message: "Note not found" }, 404);
    }

    const dataToUpdate: { title?: string; content?: string } = {};

    if (title) {
      dataToUpdate.title = title;
    }

    if (content) {
      dataToUpdate.content = content;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return c.json({ message: "No valid data provided for update" }, 400);
    }

    const updatedNote = await prisma.notes.update({
      where: {
        id: Number(note_id),
      },
      data: dataToUpdate,
    });

    return c.json({ message: "Note updated successfully!", note: updatedNote });
  } catch (error: any) {
    console.error("Error updating note:", error.message);
    return c.json(
      { message: "Failed to update note", error: error.message },
      500
    );
  }
};

export const starNote = async (c: Context) => {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: c.env.DATABASE_URL,
      },
    },
  }).$extends(withAccelerate());

  const body = await c.req.json();
  const user = c.get("user_id");

  try {
    const existingStar = await prisma.starred.findFirst({
      where: {
        authorId: user.id,
        noteId: Number(body.noteId),
      },
    });

    if (existingStar) {
      return c.json({ message: "Note already starred" }, 200);
    }

    const star = await prisma.starred.create({
      data: {
        authorId: user.id,
        noteId: Number(body.noteId),
      },
    });

    const existingNote = await prisma.notes.findUnique({
      where: {
        id: Number(body.noteId),
      },
    });

    const StarredNote = await prisma.notes.update({
      where: {
        id: Number(body.noteId),
      },
      data: {
        iStared: true, // Correct field name
      },
    });

    return c.json(StarredNote);
  } catch (error: any) {
    console.error("Error Star note:", error.message);
    return c.json(
      { message: "Failed to Unstar note", error: error.message },
      500
    );
  }
};

export const unstarNote = async (c: Context) => {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: c.env.DATABASE_URL,
      },
    },
  }).$extends(withAccelerate());

  const body = await c.req.json();
  const user = c.get("user_id");

  try {
    const existingStar = await prisma.starred.findFirst({
      where: {
        noteId: Number(body.noteId),
      },
    });

    if (!existingStar) {
      return c.json({ message: "Note not found or not starred" }, 404);
    }

    // Delete the starred record
    await prisma.starred.delete({
      where: {
        id: Number(existingStar.id),
      },
    });

    // Update the note to set isStarred to false
    const UnStarredNote = await prisma.notes.update({
      where: {
        id: Number(body.noteId),
      },
      data: {
        iStared: false, // Correct field name
      },
    });

    return c.json(UnStarredNote);
  } catch (error: any) {
    console.error("Error unstarring note:", error.message);
    return c.json(
      { message: "Failed to unstar note", error: error.message },
      500
    );
  }
};

export const getStarredNotes = async (c: Context) => {
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
    const starredNotes = await prisma.starred.findMany({
      where: {
        authorId: user.id,
      },
      include: {
        note: true, // This will include the note data in the result
      },
    });

    // Return the notes in the response
    return c.json(starredNotes);
  } catch (error) {
    console.error("Error getting note:", error);
    return c.json({ message: "Failed to get notes", error }, 500);
  }
};
