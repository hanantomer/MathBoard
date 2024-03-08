set NODE_ENV=test
set API_PORT=17035
set MESSAGING_PORT=18035

start node --watch C:\dev\MathBoard\math-messages\build\app.js
start node --watch C:\dev\MathBoard\math-server\build\app.js
REM vite takes port from .env.test
npx vite -d -m test
pause

