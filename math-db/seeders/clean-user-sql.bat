@echo off
REM Execute the PostgreSQL script for the MathBoard DB user seeder.
REM Ensure DEV_DATABASE_URL is set to a valid PostgreSQL connection string.
REM Example:
REM   set DEV_DATABASE_URL=postgres://username:password@localhost:5432/mathboard

if "%DEV_DATABASE_URL%"=="" (
  echo ERROR: DEV_DATABASE_URL is not defined.
  echo Set DEV_DATABASE_URL=postgres://user:password@host:port/dbname
  exit /b 1
)

if "%PSQL_PATH%"=="" (
  set "PSQL_PATH=C:\Program Files\PostgreSQL\17\bin\psql"
)

"%PSQL_PATH%" %DEV_DATABASE_URL% -f "%~dp0user.sql"
if errorlevel 1 (
  echo ERROR: Failed to execute user.sql
  exit /b 1
)
echo user.sql executed successfully.
