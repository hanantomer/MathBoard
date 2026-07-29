@echo off
REM Sync practice questions from math-common/src/practiceQuestionTemplates.ts
REM Idempotent — safe to re-run; skips stems that already have notations.
REM Called from seed.bat; can also run standalone after user.sql.

cd /d C:\dev\MathBoard\math-common
call npx tsc -b
if errorlevel 1 exit /b 1

cd /d C:\dev\MathBoard\math-db
call npx tsc -b
if errorlevel 1 exit /b 1

node build\seedPracticeQuestions.js
if errorlevel 1 exit /b 1
