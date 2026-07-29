REM MathBoard database seed (development).
REM Requires DEV_DATABASE_URL (same as the server).
REM
REM 1. Users (seeders/user.sql)
REM 2. Practice question bank — names + board stems from math-common templates

"C:\Program Files\PostgreSQL\17\bin\psql" %DEV_DATABASE_URL% -f C:/dev/MathBoard/math-db/seeders/user.sql
if errorlevel 1 exit /b 1

call "%~dp0seedPracticeQuestions.bat"
if errorlevel 1 exit /b 1
