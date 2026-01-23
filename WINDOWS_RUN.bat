@echo off
REM Windows batch file to run OdelAdsPro with MongoDB

echo Starting OdelAdsPro...
echo Make sure mongod is running!
echo.

REM Run with cross-env using npx
npx cross-env NODE_ENV=development npx tsx server/index-dev.ts

pause
