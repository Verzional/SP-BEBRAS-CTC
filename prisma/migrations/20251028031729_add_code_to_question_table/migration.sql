/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Question` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "code" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Question_code_key" ON "Question"("code");
