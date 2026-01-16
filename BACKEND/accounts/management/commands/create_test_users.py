from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from accounts.models import Profile

class Command(BaseCommand):
    help = 'Creates test users for development'

    def handle(self, *args, **options):
        test_users = [
            {'email': 'admin@campus.edu', 'password': 'admin123', 'role': 'admin'},
            {'email': 'student@campus.edu', 'password': 'student123', 'role': 'student'},
            {'email': 'lecturer@campus.edu', 'password': 'lecturer123', 'role': 'lecturer'},
            {'email': 'manager@campus.edu', 'password': 'manager123', 'role': 'manager'},
        ]

        for user_data in test_users:
            email = user_data['email']
            password = user_data['password']
            role = user_data['role']

            if User.objects.filter(username=email).exists():
                self.stdout.write(self.style.WARNING(f'User {email} already exists'))
                user = User.objects.get(username=email)
            else:
                user = User.objects.create_user(username=email, email=email, password=password)
                self.stdout.write(self.style.SUCCESS(f'Created user: {email}'))
            
            # Update admin privileges
            if role == 'admin':
                user.is_staff = True
                user.is_superuser = True
                user.save()

            # Always update profile role to ensure it's correct
            profile, created = Profile.objects.get_or_create(user=user)
            profile.role = role
            profile.save()
            self.stdout.write(self.style.SUCCESS(f'  Role set to: {role}'))

        self.stdout.write(self.style.SUCCESS('\nAll test users created!'))
        self.stdout.write('\nLogin Credentials:')
        self.stdout.write('=' * 50)
        for user_data in test_users:
            self.stdout.write(f'{user_data["role"].capitalize():10} {user_data["email"]:25} / {user_data["password"]}')
        self.stdout.write('=' * 50)
