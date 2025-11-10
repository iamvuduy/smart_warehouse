"""
Start backend server programmatically
"""
import subprocess
import sys
import os

# Change to backend directory
backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
os.chdir(backend_dir)

print("=" * 60)
print("Starting Backend Server...")
print("=" * 60)
print(f"Working directory: {os.getcwd()}")
print("Server will run on: http://localhost:8000")
print("Press Ctrl+C to stop")
print("=" * 60)
print()

# Start uvicorn
try:
    subprocess.run([
        sys.executable, "-m", "uvicorn",
        "main:app",
        "--reload",
        "--port", "8000",
        "--host", "127.0.0.1"
    ])
except KeyboardInterrupt:
    print("\n\nServer stopped.")
