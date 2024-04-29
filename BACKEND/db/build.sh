#!/bin/bash

# Exit script if any command fails
set -e

# Ensure the script is executable
chmod +x build.sh

# Install dependencies from requirements.txt
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Optionally, you can also include other build steps, migrations, etc.
echo "Applying database migrations..."
python manage.py migrate --noinput
