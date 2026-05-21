ALTER TABLE "LessonImage" ADD COLUMN IF NOT EXISTS "rotation" integer DEFAULT 0;
ALTER TABLE "QuestionImage" ADD COLUMN IF NOT EXISTS "rotation" integer DEFAULT 0;
ALTER TABLE "AnswerImage" ADD COLUMN IF NOT EXISTS "rotation" integer DEFAULT 0;
