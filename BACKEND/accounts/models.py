from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    ROLE_CHOICES = [
        ("student", "Student"),
        ("lecturer", "Lecturer"),
        ("manager", "Manager"),
        ("admin", "Admin"),
    ]
    
    MANAGER_TYPE_CHOICES = [
        ("general", "General Manager"),
        ("librarian", "Librarian"),
        ("it", "IT Manager"),
        ("facilities", "Facilities Manager"),
        ("maintenance", "Maintenance Manager"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, blank=True, default="student")
    department = models.CharField(max_length=100, blank=True, null=True)
    manager_type = models.CharField(max_length=20, choices=MANAGER_TYPE_CHOICES, blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} ({self.role or 'no-role'})"


class RoleRequest(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="role_requests")
    requested_role = models.CharField(max_length=20, choices=Profile.ROLE_CHOICES)
    manager_type = models.CharField(max_length=20, choices=Profile.MANAGER_TYPE_CHOICES, blank=True, null=True)
    reason = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    requested_at = models.DateTimeField(auto_now_add=True)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="approved_role_requests")
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} requested {self.requested_role} ({self.status})"


class LibraryStatus(models.Model):
    name = models.CharField(max_length=100, default='Main Library')
    current_occupancy = models.IntegerField(default=0)
    max_capacity = models.IntegerField(default=100)
    is_open = models.BooleanField(default=True)
    last_updated = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='library_updates')

    class Meta:
        verbose_name_plural = 'Library Statuses'

    def __str__(self):
        return f"{self.name} ({self.current_occupancy}/{self.max_capacity})"


class LabStatus(models.Model):
    name = models.CharField(max_length=100)
    building = models.CharField(max_length=100)
    room_number = models.CharField(max_length=50)
    current_occupancy = models.IntegerField(default=0)
    max_capacity = models.IntegerField(default=30)
    is_available = models.BooleanField(default=True)
    equipment_status = models.TextField(blank=True)
    last_updated = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='lab_updates')

    class Meta:
        verbose_name_plural = 'Lab Statuses'
        unique_together = [['building', 'room_number']]

    def __str__(self):
        return f"{self.name} - {self.building} Room {self.room_number}"


class ClassroomStatus(models.Model):
    name = models.CharField(max_length=100)
    building = models.CharField(max_length=100)
    room_number = models.CharField(max_length=50)
    current_occupancy = models.IntegerField(default=0)
    max_capacity = models.IntegerField(default=50)
    is_available = models.BooleanField(default=True)
    last_updated = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='classroom_updates')

    class Meta:
        verbose_name_plural = 'Classroom Statuses'
        unique_together = [['building', 'room_number']]

    def __str__(self):
        return f"{self.name} - {self.building} Room {self.room_number}"


class FaultReport(models.Model):
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('done', 'Done'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]
    
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
        ('other', 'Other'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    location_type = models.CharField(max_length=50)
    building = models.CharField(max_length=100)
    room_number = models.CharField(max_length=50)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    image_url = models.URLField(blank=True)
    assigned_to = models.CharField(max_length=200, blank=True)
    resolution_notes = models.TextField(blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    reporter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='fault_reports')

    def __str__(self):
        return f"{self.title} - {self.building} Room {self.room_number}"


class LibraryUpdateRequest(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]
    
    library = models.ForeignKey(LibraryStatus, on_delete=models.CASCADE, related_name='update_requests')
    requested_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='library_update_requests')
    requested_current_occupancy = models.IntegerField()
    requested_is_open = models.BooleanField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    requested_at = models.DateTimeField(auto_now_add=True)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="approved_library_updates")
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-requested_at']
    
    def __str__(self):
        return f"Library update request by {self.requested_by.username} ({self.status})"


class LabUpdateRequest(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]
    
    lab = models.ForeignKey(LabStatus, on_delete=models.CASCADE, related_name='update_requests')
    requested_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='lab_update_requests')
    requested_current_occupancy = models.IntegerField(null=True, blank=True)
    requested_is_available = models.BooleanField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    requested_at = models.DateTimeField(auto_now_add=True)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="approved_lab_updates")
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-requested_at']
    
    def __str__(self):
        return f"Lab update request by {self.requested_by.username} ({self.status})"


class RoomRequest(models.Model):
    ROOM_TYPE_CHOICES = [
        ("classroom", "Classroom"),
        ("lab", "Lab"),
    ]
    
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]
    
    requested_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='room_requests')
    room_type = models.CharField(max_length=20, choices=ROOM_TYPE_CHOICES)
    classroom = models.ForeignKey(ClassroomStatus, on_delete=models.CASCADE, null=True, blank=True, related_name='room_requests')
    lab = models.ForeignKey(LabStatus, on_delete=models.CASCADE, null=True, blank=True, related_name='room_requests')
    purpose = models.TextField(help_text="Purpose of the room request (e.g., course name, activity)")
    expected_attendees = models.IntegerField(default=1)
    requested_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    requested_at = models.DateTimeField(auto_now_add=True)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="approved_room_requests")
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-requested_at']
    
    def __str__(self):
        room_name = self.classroom.name if self.classroom else (self.lab.name if self.lab else "Not assigned")
        return f"{self.requested_by.username} - {self.room_type} request ({self.status})"
    
    @property
    def assigned_room(self):
        """Return the assigned room (classroom or lab)"""
        return self.classroom if self.classroom else self.lab
