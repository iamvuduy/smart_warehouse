@echo off
title Frontend Server - AI Warehouse Optimizer
echo ========================================
echo Starting Frontend Server...
echo ========================================
echo.

cd /d "%~dp0frontend"
call npm run dev

pause
