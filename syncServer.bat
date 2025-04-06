xcopy C:\dev\MathBoard\math-server\build\*.js  \\45.91.171.207\MathBoard\math-server\build /D /V /Y
xcopy C:\dev\MathBoard\math-messages\build\*.js  \\45.91.171.207\MathBoard\math-messages\build /D /V /Y
xcopy C:\dev\MathBoard\math-db\build\*.js  \\45.91.171.207\MathBoard\math-messages\build /D /V /Y /S
xcopy C:\dev\MathBoard\math-db\server\config\config.json  \\45.91.171.207\MathBoard\\math-db\server\config /D /V /Y /S
xcopy C:\dev\MathBoard\math-ui3\server.js  \\45.91.171.207\MathBoard\math-ui3 /D /V /Y /S
xcopy C:\dev\MathBoard\math-ui3\dist\*.*  \\45.91.171.207\MathBoard\math-ui3\dist /D /V /Y /S
pause