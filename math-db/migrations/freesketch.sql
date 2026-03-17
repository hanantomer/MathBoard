
CREATE SEQUENCE IF NOT EXISTS public."AnswerFreeSketch_id_seq"
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public."AnswerFreeSketch_id_seq"
    OWNED BY public."AnswerFreeSketch".id;

ALTER SEQUENCE public."AnswerFreeSketch_id_seq"
    OWNER TO postgres;


-- SEQUENCE: public.LessonFreeSketch_id_seq

-- DROP SEQUENCE IF EXISTS public."LessonFreeSketch_id_seq";

CREATE SEQUENCE IF NOT EXISTS public."LessonFreeSketch_id_seq"
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public."LessonFreeSketch_id_seq"
    OWNED BY public."LessonFreeSketch".id;

ALTER SEQUENCE public."LessonFreeSketch_id_seq"
    OWNER TO postgres;


-- SEQUENCE: public.QuestionFreeSketch_id_seq

-- DROP SEQUENCE IF EXISTS public."QuestionFreeSketch_id_seq";

CREATE SEQUENCE IF NOT EXISTS public."QuestionFreeSketch_id_seq"
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public."QuestionFreeSketch_id_seq"
    OWNED BY public."QuestionFreeSketch".id;

ALTER SEQUENCE public."QuestionFreeSketch_id_seq"
    OWNER TO postgres;        



-- Table: public.AnswerFreeSketch

-- DROP TABLE IF EXISTS public."AnswerFreeSketch";

CREATE TABLE IF NOT EXISTS public."AnswerFreeSketch"
(
    id integer NOT NULL DEFAULT nextval('"AnswerFreeSketch_id_seq"'::regclass),
    uuid uuid NOT NULL,
    points json NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "userId" integer NOT NULL,
    "answerId" integer NOT NULL,
    "colorId" integer,
    CONSTRAINT "AnswerFreeSketch_pkey" PRIMARY KEY (id),
    CONSTRAINT "AnswerFreeSketch_answerId_fkey" FOREIGN KEY ("answerId")
        REFERENCES public.answer (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE NO ACTION,
    CONSTRAINT "AnswerFreeSketch_colorId_fkey" FOREIGN KEY ("colorId")
        REFERENCES public.color (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT "AnswerFreeSketch_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES public."user" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."AnswerFreeSketch"
    OWNER to postgres;
-- Index: answer_free_sketch_answer_id

-- DROP INDEX IF EXISTS public.answer_free_sketch_answer_id;

CREATE INDEX IF NOT EXISTS answer_free_sketch_answer_id
    ON public."AnswerFreeSketch" USING btree
    ("answerId" ASC NULLS LAST)
    TABLESPACE pg_default;

-- Table: public.LessonFreeSketch

-- DROP TABLE IF EXISTS public."LessonFreeSketch";

CREATE TABLE IF NOT EXISTS public."LessonFreeSketch"
(
    id integer NOT NULL DEFAULT nextval('"LessonFreeSketch_id_seq"'::regclass),
    uuid uuid NOT NULL,
    points json NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "userId" integer NOT NULL,
    "lessonId" integer NOT NULL,
    "colorId" integer,
    CONSTRAINT "LessonFreeSketch_pkey" PRIMARY KEY (id),
    CONSTRAINT "LessonFreeSketch_colorId_fkey" FOREIGN KEY ("colorId")
        REFERENCES public.color (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT "LessonFreeSketch_lessonId_fkey" FOREIGN KEY ("lessonId")
        REFERENCES public.lesson (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE NO ACTION,
    CONSTRAINT "LessonFreeSketch_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES public."user" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."LessonFreeSketch"
    OWNER to postgres;
-- Index: lesson_free_sketch_lesson_id

-- DROP INDEX IF EXISTS public.lesson_free_sketch_lesson_id;

CREATE INDEX IF NOT EXISTS lesson_free_sketch_lesson_id
    ON public."LessonFreeSketch" USING btree
    ("lessonId" ASC NULLS LAST)
    TABLESPACE pg_default;


-- Table: public.QuestionFreeSketch

-- DROP TABLE IF EXISTS public."QuestionFreeSketch";

CREATE TABLE IF NOT EXISTS public."QuestionFreeSketch"
(
    id integer NOT NULL DEFAULT nextval('"QuestionFreeSketch_id_seq"'::regclass),
    uuid uuid NOT NULL,
    points json NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "userId" integer NOT NULL,
    "questionId" integer NOT NULL,
    "colorId" integer,
    CONSTRAINT "QuestionFreeSketch_pkey" PRIMARY KEY (id),
    CONSTRAINT "QuestionFreeSketch_colorId_fkey" FOREIGN KEY ("colorId")
        REFERENCES public.color (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT "QuestionFreeSketch_questionId_fkey" FOREIGN KEY ("questionId")
        REFERENCES public.question (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE NO ACTION,
    CONSTRAINT "QuestionFreeSketch_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES public."user" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."QuestionFreeSketch"
    OWNER to postgres;
-- Index: question_free_sketch_question_id

-- DROP INDEX IF EXISTS public.question_free_sketch_question_id;

CREATE INDEX IF NOT EXISTS question_free_sketch_question_id
    ON public."QuestionFreeSketch" USING btree
    ("questionId" ASC NULLS LAST)
    TABLESPACE pg_default;        