from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('lecturer', 'Lecturer'),
        ('manager', 'Manager'),
        ('admin', 'Admin'),
        ('admin', 'Admin'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    department = models.CharField(max_length=100, blank=True, null=True)
    manager_type = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)
    
    def __str__(self):
        return f"{self.user.email} - {self.role}"

class RoleRequest(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    requested_role = models.CharField(max_length=20)
    reason = models.TextField(blank=True)
    status = models.CharField(max_length=20, default='pending', choices=[
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ])
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.email} - {self.requested_role}"

class LibraryStatus(models.Model):
    name = models.CharField(max_length=200)
    max_capacity = models.IntegerField(default=100)
    current_occupancy = models.IntegerField(default=0)
    is_open = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    @property
    def occupancy_percentage(self):
        if self.max_capacity > 0:
            return round((self.current_occupancy / self.max_capacity) * 100)
        return 0

    def __str__(self):
        return self.name

class LabStatus(models.Model):
    name = models.CharField(max_length=200)
    building = models.CharField(max_length=100, blank=True)
    room_number = models.CharField(max_length=50, blank=True)
    max_capacity = models.IntegerField(default=30)
    current_occupancy = models.IntegerField(default=0)
    is_available = models.BooleanField(default=True)
    equipment_status = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} - {self.building}"

class ClassroomStatus(models.Model):
    name = models.CharField(max_length=200)
    building = models.CharField(max_length=100, blank=True)
    room_number = models.CharField(max_length=50, blank=True)
    max_capacity = models.IntegerField(default=50)
    current_occupancy = models.IntegerField(default=0)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    @property
    def occupancy_percentage(self):
        if self.max_capacity > 0:
            return round((self.current_occupancy / self.max_capacity) * 100)
        return 0

    def __str__(self):
        return f"{self.name} - {self.building}"

class LibraryUpdateRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    library = models.ForeignKey(LibraryStatus, on_delete=models.CASCADE, null=True, blank=True)
    requested_by = models.ForeignKey(User, on_delete=models.CASCADE)
    requested_current_occupancy = models.IntegerField()
    requested_is_open = models.BooleanField()
    requested_name = models.CharField(max_length=200, blank=True)
    requested_max_capacity = models.IntegerField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_library_updates')
    rejection_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Library update request by {self.requested_by.email}"

class LabUpdateRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    lab = models.ForeignKey(LabStatus, on_delete=models.CASCADE)
    requested_by = models.ForeignKey(User, on_delete=models.CASCADE)
    requested_current_occupancy = models.IntegerField()
    requested_is_available = models.BooleanField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_lab_updates')
    rejection_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Lab update request by {self.requested_by.email}"

class RoomRequest(models.Model):
    ROOM_TYPE_CHOICES = [
        ('classroom', 'Classroom'),
        ('lab', 'Lab'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    requested_by = models.ForeignKey(User, on_delete=models.CASCADE)
    room_type = models.CharField(max_length=20, choices=ROOM_TYPE_CHOICES)
    classroom = models.ForeignKey(ClassroomStatus, on_delete=models.SET_NULL, null=True, blank=True)
    lab = models.ForeignKey(LabStatus, on_delete=models.SET_NULL, null=True, blank=True)
    purpose = models.TextField()
    expected_attendees = models.IntegerField(default=1)
    requested_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_room_requests')
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Room request by {self.requested_by.email}"

class FaultReport(models.Model):
    SEVERITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    CATEGORY_CHOICES = [
        ('projector', 'Projector / Display'),
        ('ac', 'Air Conditioning'),
        ('lighting', 'Lighting'),
        ('furniture', 'Furniture'),
        ('computer', 'Computer / Hardware'),
        ('network', 'Network / WiFi'),
        ('plumbing', 'Plumbing'),
        ('electrical', 'Electrical'),
        ('hvac', 'HVAC'),
        ('equipment', 'Equipment'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('done', 'Done'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]
    
    reported_by = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField()
    location = models.CharField(max_length=200, blank=True)
    building = models.CharField(max_length=100, blank=True)
    room_number = models.CharField(max_length=50, blank=True)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='medium')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    assigned_to = models.CharField(max_length=200, blank=True)
    resolution_notes = models.TextField(blank=True)
    image = models.CharField(max_length=500, blank=True, null=True)  # Store image URL instead
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
class OverloadRecord(models.Model):
    RESOURCE_CHOICES = [
        ('cpu', 'CPU'),
        ('memory', 'Memory'),
        ('network', 'Network'),
        ('occupancy', 'Occupancy'),
    ]
    
    resource_type = models.CharField(max_length=20, choices=RESOURCE_CHOICES)
    location = models.CharField(max_length=200, blank=True)
    building = models.CharField(max_length=100, blank=True)
    room_number = models.CharField(max_length=50, blank=True)
    description = models.TextField(blank=True)
    threshold_value = models.FloatField(default=0.0)
    current_value = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.resource_type} overload at {self.location} - {self.created_at}"

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    action_link = models.CharField(max_length=200, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.email} - {self.title}"

# Import signals to ensure they are registered
from . import signals
