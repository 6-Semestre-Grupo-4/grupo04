from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


# Modelos Personalizados
from .models import Address, Company, BillingPlan, BillingAccount

from .serializers import AddressSerializer, CompanySerializer, BillingPlanSerializer, BillingAccountSerializer

def get_object_by_pk(model, pk):
    try:
        return model.objects.get(pk=pk)
    except model.DoesNotExist:
        raise Http404

class AddressList(APIView):
    def get(self, request, format=None):
        items = Address.objects.all()
        serializer = AddressSerializer(items, many=True)
        return Response(serializer.data)
    def post(self, request, format=None):
        serializer = AddressSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AddressDetail(APIView):
    def get(self, request, pk, format=None):
        item = get_object_by_pk(Address, pk)
        serializer = AddressSerializer(item)
        return Response(serializer.data)
    def put(self, request, pk, format=None):
        item = get_object_by_pk(Address, pk)
        serializer = AddressSerializer(item, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def delete(self, request, pk, format=None):
        item = get_object_by_pk(Address, pk)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class CompanyList(APIView):
    def get(self, request, format=None):
        items = Company.objects.all()
        serializer = CompanySerializer(items, many=True)
        return Response(serializer.data)
    def post(self, request, format=None):
        serializer = CompanySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CompanyDetail(APIView):
    def get(self, request, pk, format=None):
        item = get_object_by_pk(Company, pk)
        serializer = CompanySerializer(item)
        return Response(serializer.data)
    def put(self, request, pk, format=None):
        item = get_object_by_pk(Company, pk)
        serializer = CompanySerializer(item, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def delete(self, request, pk, format=None):
        item = get_object_by_pk(Company, pk)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class BillingPlanList(APIView):
    def get(self, request, format=None):
        items = BillingPlan.objects.all()
        serializer = BillingPlanSerializer(items, many=True)
        return Response(serializer.data)
    def post(self, request, format=None):
        serializer = BillingPlanSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class BillingPlanDetail(APIView):
    def get(self, request, pk, format=None):
        item = get_object_by_pk(BillingPlan, pk)
        serializer = BillingPlanSerializer(item)
        return Response(serializer.data)
    def put(self, request, pk, format=None):
        item = get_object_by_pk(BillingPlan, pk)
        serializer = BillingPlanSerializer(item, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def delete(self, request, pk, format=None):
        item = get_object_by_pk(BillingPlan, pk)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
class BillingAccountList(APIView):
    def get(self, request, format=None):
        items = BillingAccount.objects.all()
        serializer = BillingAccountSerializer(items, many=True)
        return Response(serializer.data)
    def post(self, request, format=None):
        serializer = BillingAccountSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class BillingAccountDetail(APIView):
    def get(self, request, pk, format=None):
        item = get_object_by_pk(BillingAccount, pk)
        serializer = BillingAccountSerializer(item)
        return Response(serializer.data)
    def put(self, request, pk, format=None):
        item= get_object_by_pk(BillingAccount, pk)
        serializer = BillingAccountSerializer(item, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def delete(self, request, pk, format=None):
        item = get_object_by_pk(BillingAccount, pk)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)