"""
WSGI config for project_sce project.

It exposes the WSGI callable as a module-level variable named `application`.
"""

import os
from django.core.wsgi import get_wsgi_application

# Tell Django which settings to use
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project_sce.settings')

# WSGI callable
application = get_wsgi_application()
