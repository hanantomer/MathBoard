@echo off
REM Sync practice questions from math-common templates into the DB.
REM Idempotent — safe to re-run; skips stems that already have notations.
REM
REM Dev: compiles math-common + math-db when tsconfig.json is present.
REM Prod: skips tsc and runs the existing build\seedPracticeQuestions.js
REM       (set NODE_ENV=prod and DATABASE_URL before running).

setlocal
set "DB_ROOT=%~dp0.."
set "COMMON_ROOT=%~dp0..\..\math-common"

if exist "%COMMON_ROOT%\tsconfig.json" (
  pushd "%COMMON_ROOT%"
  call npx tsc -b
  if errorlevel 1 (
    popd
    exit /b 1
  )
  popd
) else (
  echo Skipping math-common compile ^(no tsconfig.json^).
)

if exist "%DB_ROOT%\tsconfig.json" (
  pushd "%DB_ROOT%"
  call npx tsc -b
  if errorlevel 1 (
    popd
    exit /b 1
  )
  popd
) else (
  echo Skipping math-db compile ^(no tsconfig.json^).
)

if not exist "%DB_ROOT%\build\seedPracticeQuestions.js" (
  echo ERROR: %DB_ROOT%\build\seedPracticeQuestions.js not found.
  echo Build math-db before seeding, or deploy the build folder to production.
  exit /b 1
)

pushd "%DB_ROOT%"
node build\seedPracticeQuestions.js
set "SEED_EXIT=%ERRORLEVEL%"
popd
exit /b %SEED_EXIT%
