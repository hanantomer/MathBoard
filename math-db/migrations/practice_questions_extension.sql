-- Practice question bank: extension table (stem + notations stay on question).
--
-- Naming matches this project: singular tables (question, user, lesson),
-- camelCase for junction/extension tables (studentLesson, practiceQuestion).
--
-- Assumes the schema BEFORE the abandoned Phase 1 migration:
--   - question."lessonId" is NOT NULL (every row is a lesson question)
--   - question has NO subject column
--   - practiceQuestion table does not exist
--
-- Existing lesson questions are unchanged. New practice items are created via the app:
--   question row with lessonId NULL + matching practiceQuestion row.
--
-- Safe to re-run: uses IF NOT EXISTS / IF EXISTS where practical.

CREATE TABLE IF NOT EXISTS "practiceQuestion" (
    id          SERIAL PRIMARY KEY,
    uuid        UUID NOT NULL DEFAULT gen_random_uuid(),
    "questionId" INTEGER NOT NULL UNIQUE
        REFERENCES "question"(id) ON DELETE CASCADE,
    subject     VARCHAR(255) NOT NULL,
    "userId"    INTEGER NOT NULL REFERENCES "user"(id),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS practice_question_uuid_idx
    ON "practiceQuestion"(uuid);

CREATE INDEX IF NOT EXISTS practice_question_subject_idx
    ON "practiceQuestion"(subject);

-- Practice stems have no lesson; lesson questions keep a required lessonId in app logic.
ALTER TABLE "question" ALTER COLUMN "lessonId" DROP NOT NULL;

-- Optional cleanup if Phase 1 migration was applied locally but never committed:
ALTER TABLE "question" DROP COLUMN IF EXISTS subject;

-- Curated practice bank: run seeders/seed.bat (users + practice stems).
