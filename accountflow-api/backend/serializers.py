from rest_framework import serializers
from django.contrib.auth.models import User, Group, Permission
from django.contrib.contenttypes.models import ContentType
from .models import (
    Address,
    Company,
    BillingPlan,
    BillingAccount,
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