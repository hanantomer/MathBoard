call ./buildServers.bat
set NODE_ENV=test
set API_PORT=17035
set MESSAGING_PORT=18035

FOR /F "tokens=5 delims= " %%P IN ('netstat -a -n -o ^| findstr :18035') DO TaskKill.exe /PID %%P /f /t
FOR /F "tokens=5 delims= " %%P IN ('netstat -a -n -o ^| findstr :17035') DO TaskKill.exe /PID %%P /f /t
FOR /F "tokens=5 delims= " %%P IN ('netstat -a -n -o ^| findstr :13035') DO TaskKill.exe /PID %%P /f /t


start npx vite -d -m test
start node C:\dev\MathBoard\math-messages\build\app.js
start node C:\dev\MathBoard\math-server\build\app.js
REM vite takes port from .env.test



