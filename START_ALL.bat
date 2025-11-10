@echo off
title AI Warehouse Optimizer - Starting All Services
echo ========================================
echo AI Warehouse Optimizer
echo ========================================
echo.
echo Starting Backend and Frontend servers...
echo Please wait...
echo.

cd /d "%~dp0"

REM Start Backend in new window
start "Backend Server" cmd /k run_backend.bat

REM Wait 3 seconds for backend to start
timeout /t 3 /nobreak

REM Start Frontend in new window  
start "Frontend Server" cmd /k run_frontend.bat

echo.
echo ========================================
echo Both servers are starting!
echo ========================================
echo.
echo Backend: http://127.0.0.1:8000
echo Frontend: http://localhost:5173 or http://localhost:5174
echo.
echo Press any key to open browser...
pause

REM Open browser
start http://localhost:5173

exit
