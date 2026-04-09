BEGIN;

-- answer child tables
DELETE FROM "answerPoint"      WHERE "userId" = :userId;
DELETE FROM "answerCircle"     WHERE "userId" = :userId;
DELETE FROM "answerCurve"      WHERE "userId" = :userId;
DELETE FROM "answerFreeSketch" WHERE "userId" = :userId;
DELETE FROM "answerDivisionLine" WHERE "userId" = :userId;
DELETE FROM "answerLine"       WHERE "userId" = :userId;
DELETE FROM "answerSqrt"       WHERE "userId" = :userId;
DELETE FROM "answerAnnotation" WHERE "userId" = :userId;
DELETE FROM "answerExponent"   WHERE "userId" = :userId;
DELETE FROM "answerLogBase"    WHERE "userId" = :userId;
DELETE FROM "answerSign"       WHERE "userId" = :userId;
DELETE FROM "answerSymbol"     WHERE "userId" = :userId;
DELETE FROM "answerImage"      WHERE "userId" = :userId;
DELETE FROM "answerText"       WHERE "userId" = :userId;

-- question child tables
DELETE FROM "questionCircle"      WHERE "userId" = :userId;
DELETE FROM "questionCurve"       WHERE "userId" = :userId;
DELETE FROM "questionFreeSketch"  WHERE "userId" = :userId;
DELETE FROM "questionDivisionLine" WHERE "userId" = :userId;
DELETE FROM "questionLine"        WHERE "userId" = :userId;
DELETE FROM "questionSqrt"        WHERE "userId" = :userId;
DELETE FROM "questionAnnotation"  WHERE "userId" = :userId;
DELETE FROM "questionExponent"    WHERE "userId" = :userId;
DELETE FROM "questionLogBase"     WHERE "userId" = :userId;
DELETE FROM "questionSign"        WHERE "userId" = :userId;
DELETE FROM "questionSymbol"      WHERE "userId" = :userId;
DELETE FROM "questionImage"       WHERE "userId" = :userId;
DELETE FROM "questionText"        WHERE "userId" = :userId;
DELETE FROM "questionTriangle"    WHERE "userId" = :userId;

-- lesson child tables
DELETE FROM "lessonCircle"      WHERE "userId" = :userId;
DELETE FROM "lessonCurve"       WHERE "userId" = :userId;
DELETE FROM "lessonFreeSketch"  WHERE "userId" = :userId;
DELETE FROM "lessonDivisionLine" WHERE "userId" = :userId;
DELETE FROM "lessonLine"        WHERE "userId" = :userId;
DELETE FROM "lessonSqrt"        WHERE "userId" = :userId;
DELETE FROM "lessonAnnotation"  WHERE "userId" = :userId;
DELETE FROM "lessonExponent"    WHERE "userId" = :userId;
DELETE FROM "lessonLogBase"     WHERE "userId" = :userId;
DELETE FROM "lessonSign"        WHERE "userId" = :userId;
DELETE FROM "lessonSymbol"      WHERE "userId" = :userId;
DELETE FROM "lessonImage"       WHERE "userId" = :userId;
DELETE FROM "lessonText"        WHERE "userId" = :userId;
DELETE FROM "lessonTriangle"    WHERE "userId" = :userId;

-- join table
DELETE FROM "studentLesson" WHERE "userId" = :userId;

-- top-level tables
DELETE FROM "answer"   WHERE "userId" = :userId;
DELETE FROM "question" WHERE "userId" = :userId;
DELETE FROM "lesson"   WHERE "userId" = :userId;
DELETE FROM "user"     WHERE "id"     = :userId;

COMMIT;