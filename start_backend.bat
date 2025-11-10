@echo off
echo Starting Backend Server...
echo.
backend\.venv\Scripts\python.exe -m uvicorn backend.main:app --reload --port 8000
pause
