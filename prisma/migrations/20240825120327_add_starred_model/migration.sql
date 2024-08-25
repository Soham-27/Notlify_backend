-- AlterTable
ALTER TABLE "Notes" ADD COLUMN     "iStared" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Starred" (
    "id" SERIAL NOT NULL,
    "authorId" INTEGER NOT NULL,
    "noteId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Starred_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Starred" ADD CONSTRAINT "Starred_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Starred" ADD CONSTRAINT "Starred_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Notes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
