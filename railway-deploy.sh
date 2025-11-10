#!/bin/bash
# Railway deployment script

echo "Starting deployment..."

# Install Python dependencies
pip install -r requirements.txt

# Create database if needed
cd backend
python -c "from database import init_db; init_db()"

echo "Deployment preparation complete!"
