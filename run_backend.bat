@echo off
title Backend Server - AI Warehouse Optimizer
echo ========================================
echo Starting Backend Server...
echo ========================================
echo.

cd /d "%~dp0"
set PYTHONPATH=%CD%

echo Current directory: %CD%
echo Python path: %PYTHONPATH%
echo.

call backend\.venv\Scripts\activate.bat
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

pause
