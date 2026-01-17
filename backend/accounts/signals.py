from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import RoleRequest, Profile

@receiver(post_save, sender=RoleRequest)
def update_profile_role(sender, instance, **kwargs):
    if instance.status == 'approved':
        try:
            profile = instance.user.profile
            profile.role = instance.requested_role
            profile.save()
        except Profile.DoesNotExist:
            pass
