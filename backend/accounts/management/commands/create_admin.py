from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from accounts.models import Profile


class Command(BaseCommand):
    help = 'Creates the first admin user'

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            default='admin@campus.edu',
            help='Admin email address'
        )
        parser.add_argument(
            '--password',
            type=str,
            default='admin123',
            help='Admin password'
        )

    def handle(self, *args, **options):
        email = options['email']
        password = options['password']
        
        # Check if admin already exists
        if User.objects.filter(username=email).exists():
            self.stdout.write(
                self.style.WARNING(f'User with email {email} already exists!')
            )
            return
        
        # Create admin user
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password
        )
        
        # Set admin role
        profile, created = Profile.objects.get_or_create(user=user)
        profile.role = 'admin'
        profile.save()
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created admin user!\n'
                f'Email: {email}\n'
                f'Password: {password}\n'
                f'You can now login with these credentials.'
            )
        )
