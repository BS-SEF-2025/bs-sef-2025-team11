from rest_framework import serializers
from .models import IssueReport, RecurringPattern


class IssueReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = IssueReport
        fields = [
            "id",
            "issue_type",
            "location",
            "title",
            "description",
            "severity",
            "reported_by",
            "created_at",
        ]
        read_only_fields = ["id", "reported_by", "created_at"]


class RecurringPatternSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecurringPattern
        fields = [
            "id",
            "issue_type",
            "pattern_key",
            "location",
            "title_norm",
            "window_days",
            "threshold",
            "count_in_window",
            "first_seen",
            "last_seen",
            "last_computed_at",
        ]
        read_only_fields = fields
