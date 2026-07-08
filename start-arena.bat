@echo off
echo ============================================================
echo      Ezy Arena - Full-Stack Smart Stadium Platform Launcher
echo ============================================================
echo.
echo Launching Express Backend Server in a new window...
start cmd /k "cd backend && npm run dev"

echo Launching Next.js 15 Frontend Client in a new window...
start cmd /k "cd frontend && npm run dev"

echo.
echo Both servers have been initiated! 
echo.
echo 1. The backend server runs on: http://localhost:5000
echo 2. The frontend client runs on: http://localhost:3000
echo.
echo Please wait a few seconds for compilation, then open your browser and visit:
echo http://localhost:3000
echo.
pause
