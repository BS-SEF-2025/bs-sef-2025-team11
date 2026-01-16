from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from accounts.models import Profile

class Command(BaseCommand):
    help = 'Creates test users for all roles'

    def handle(self, *args, **options):
        users = [
            {
                'email': 'admin@campus.edu',
                'password': 'admin123',
                'role': 'admin',
                'manager_type': None
            },
            {
                'email': 'student@campus.edu',
                'password': 'student123',
                'role': 'student',
                'manager_type': None
            },
            {
                'email': 'lecturer@campus.edu',
                'password': 'lecturer123',
                'role': 'lecturer',
                'manager_type': None
            },
            {
                'email': 'manager@campus.edu',
                'password': 'manager123',
                'role': 'manager',
                'manager_type': 'library'
            }
        ]

        for user_data in users:
            email = user_data['email']
            password = user_data['password']
            role = user_data['role']
            manager_type = user_data['manager_type']

            if User.objects.filter(username=email).exists():
                self.stdout.write(
                    self.style.WARNING(f'User {email} already exists')
                )
                continue

            user = User.objects.create_user(
                username=email,
                email=email,
                password=password
            )

            profile, created = Profile.objects.get_or_create(user=user)
            profile.role = role
            if manager_type:
                profile.manager_type = manager_type
            profile.save()

            self.stdout.write(
                self.style.SUCCESS(f'Successfully created {role} user: {email}')
            )
