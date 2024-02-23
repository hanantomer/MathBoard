set NODE_ENV=test
set API_PORT=8089
set MESSAGING_PORT=8099
start node C:\dev\MathBoard\math-server\build\app.js
start node C:\dev\MathBoard\math-messages\build\app.js
npm run dev
pause


