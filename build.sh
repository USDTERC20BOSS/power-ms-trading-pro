#!/bin/bash
# Install Python dependencies
pip install -r requirements.txt

# Install frontend dependencies
cd frontend
npm install
npm run build

# Move build files to the correct location
cd ..
mkdir -p static
cp -r frontend/build/* static/
