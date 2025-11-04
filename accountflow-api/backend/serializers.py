from rest_framework import serializers
from .models import (
    Address,
    Company,
    BillingPlan,
    BillingAccount,
    Preset,
    Title,
)

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = '__all__'

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = '__all__'

class BillingPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = BillingPlan
        fields = '__all__'

class BillingAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = BillingAccount
        fields = '__all__'

class PresetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Preset
        fields = '__all__'

class TitleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Title
        fields = '__all__'