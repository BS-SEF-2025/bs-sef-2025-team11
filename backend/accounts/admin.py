from django.contrib import admin
from .models import (
    Profile, RoleRequest, LibraryStatus, LabStatus, ClassroomStatus,
    LibraryUpdateRequest, LabUpdateRequest, RoomRequest, FaultReport
)

admin.site.register(Profile)
admin.site.register(RoleRequest)
admin.site.register(LibraryStatus)
admin.site.register(LabStatus)
admin.site.register(ClassroomStatus)
admin.site.register(LibraryUpdateRequest)
admin.site.register(LabUpdateRequest)
admin.site.register(RoomRequest)
admin.site.register(FaultReport)
