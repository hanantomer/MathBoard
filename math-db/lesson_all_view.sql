-- View to combine all lesson notation tables
-- Common columns: id, uuid, userId, lessonId, createdAt, updatedAt
-- Adds table_type to identify the source table

CREATE VIEW all_lesson_notations AS

SELECT "id", "uuid", "userId", "lessonId", 'LessonCircle' AS table_type, "createdAt", "updatedAt"
FROM "LessonCircle"

UNION ALL

SELECT "id", "uuid", "userId", "lessonId", 'LessonCurve' AS table_type, "createdAt", "updatedAt"
FROM "LessonCurve"

UNION ALL

SELECT "id", "uuid", "userId", "lessonId", 'LessonFreeSketch' AS table_type, "createdAt", "updatedAt"
FROM "LessonFreeSketch"

UNION ALL

SELECT "id", "uuid", "userId", "lessonId", 'LessonGeo' AS table_type, "createdAt", "updatedAt"
FROM "LessonGeo"

UNION ALL

SELECT "id", "uuid", "userId", "lessonId", 'LessonText' AS table_type, "createdAt", "updatedAt"
FROM "LessonText"

UNION ALL

SELECT "id", "uuid", "userId", "lessonId", 'LessonImage' AS table_type, "createdAt", "updatedAt"
FROM "LessonImage"

UNION ALL

SELECT "id", "uuid", "userId", "lessonId", 'LessonSymbol' AS table_type, "createdAt", "updatedAt"
FROM "LessonSymbol"

UNION ALL

SELECT "id", "uuid", "userId", "lessonId", 'LessonSign' AS table_type, "createdAt", "updatedAt"
FROM "LessonSign"

UNION ALL

SELECT "id", "uuid", "userId", "lessonId", 'LessonLogBase' AS table_type, "createdAt", "updatedAt"
FROM "LessonLogBase"

UNION ALL

SELECT "id", "uuid", "userId", "lessonId", 'LessonExponent' AS table_type, "createdAt", "updatedAt"
FROM "LessonExponent"

UNION ALL

SELECT "id", "uuid", "userId", "lessonId", 'LessonAnnotation' AS table_type, "createdAt", "updatedAt"
FROM "LessonAnnotation"

UNION ALL

SELECT "id", "uuid", "userId", "lessonId", 'LessonSqrt' AS table_type, "createdAt", "updatedAt"
FROM "LessonSqrt"

UNION ALL

SELECT "id", "uuid", "userId", "lessonId", 'LessonLine' AS table_type, "createdAt", "updatedAt"
FROM "LessonLine"

UNION ALL

SELECT "id", "uuid", "userId", "lessonId", 'LessonDivisionLine' AS table_type, "createdAt", "updatedAt"
FROM "LessonDivisionLine";