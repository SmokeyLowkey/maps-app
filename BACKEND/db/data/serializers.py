from rest_framework import serializers
from .models import BranchData

class BranchDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = BranchData
        fields = ['code', 'branchName', 'branchCity', 'details', 'contact', 'timeZone', 'coordinates']

    def create(self, validated_data):
        return BranchData.objects.update_or_create(
            code=validated_data.get('code', None),
            defaults=validated_data
        )[0]

    def update(self, instance, validated_data):
        instance.branchName = validated_data.get('branchName', instance.branchName)
        instance.branchCity = validated_data.get('branchCity', instance.branchCity)
        instance.details = validated_data.get('details', instance.details)
        instance.contact = validated_data.get('contact', instance.contact)
        instance.timeZone = validated_data.get('timeZone', instance.timeZone)
        instance.coordinates = validated_data.get('coordinates', instance.coordinates)
        instance.save()
        return instance