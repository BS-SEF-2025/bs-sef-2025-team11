import os
from django.core.wsgi import get_wsgi_application

# Set the default settings module for the 'occupancy_project' project
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'occupancy_project.settings')

# Get the WSGI application object that Django’s built-in servers use
application = get_wsgi_application()
