from django.http import Http404
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from rest_framework import status

from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import DjangoModelPermissions, IsAuthenticated

# Modelos Personalizados
from .models import Address, Company, BillingPlan, BillingAccount, Preset, Title, Entry

from .serializers import AddressSerializer, CompanySerializer, BillingPlanSerializer, BillingAccountSerializer, PresetSerializer, TitleSerializer, EntrySerializer

def get_object_by_pk(model, pk):
    try:
        return model.objects.get(pk=pk)
    except model.DoesNotExist:
        raise Http404

class AddressList(GenericAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [DjangoModelPermissions]
    queryset = Address.objects.all()
    serializer_class = AddressSerializer

    def get(self, request, format=None):
        items = self.get_queryset()
        serializer = self.serializer_class(items, many=True)
        return Response(serializer.data)
    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AddressDetail(GenericAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [DjangoModelPermissions]
    queryset = Address.objects.all()
    serializer_class = AddressSerializer

    def get(self, request, pk, format=None):
        item = get_object_by_pk(Address, pk)
        serializer = self.serializer_class(item)
        return Response(serializer.data)
    def put(self, request, pk, format=None):
        item = get_object_by_pk(Address, pk)
        serializer = self.serializer_class(item, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def delete(self, request, pk, format=None):
        item = get_object_by_pk(Address, pk)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class CompanyList(GenericAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [DjangoModelPermissions]
    queryset = Company.objects.all()
    serializer_class = CompanySerializer

    def get(self, request, format=None):
        items = self.get_queryset()
        serializer = self.serializer_class(items, many=True)
        return Response(serializer.data)
    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CompanyDetail(GenericAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [DjangoModelPermissions]
    queryset = Company.objects.all()
    serializer_class = CompanySerializer

    def get(self, request, pk, format=None):
        item = get_object_by_pk(Company, pk)
        serializer = self.serializer_class(item)
        return Response(serializer.data)
    def put(self, request, pk, format=None):
        item = get_object_by_pk(Company, pk)
        serializer = self.serializer_class(item, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def delete(self, request, pk, format=None):
        item = get_object_by_pk(Company, pk)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class BillingPlanList(GenericAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [DjangoModelPermissions]
    queryset = BillingPlan.objects.all()
    serializer_class = BillingPlanSerializer

    def get(self, request, format=None):
        items = self.get_queryset()
        serializer = self.serializer_class(items, many=True)
        return Response(serializer.data)
    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class BillingPlanDetail(GenericAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [DjangoModelPermissions]
    queryset = BillingPlan.objects.all()
    serializer_class = BillingPlanSerializer

    def get(self, request, pk, format=None):
        item = get_object_by_pk(BillingPlan, pk)
        serializer = self.serializer_class(item)
        return Response(serializer.data)
    def put(self, request, pk, format=None):
        item = get_object_by_pk(BillingPlan, pk)
        serializer = self.serializer_class(item, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def delete(self, request, pk, format=None):
        item = get_object_by_pk(BillingPlan, pk)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class BillingAccountList(GenericAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [DjangoModelPermissions]
    queryset = BillingAccount.objects.all()
    serializer_class = BillingAccountSerializer

    def get(self, request, format=None):
        items = self.get_queryset()
        serializer = self.serializer_class(items, many=True)
        return Response(serializer.data)
    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class BillingAccountDetail(GenericAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [DjangoModelPermissions]
    queryset = BillingAccount.objects.all()
    serializer_class = BillingAccountSerializer

    def get(self, request, pk, format=None):
        item = get_object_by_pk(BillingAccount, pk)
        serializer = self.serializer_class(item)
        return Response(serializer.data)
    def put(self, request, pk, format=None):
        item= get_object_by_pk(BillingAccount, pk)
        serializer = self.serializer_class(item, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def delete(self, request, pk, format=None):
        item = get_object_by_pk(BillingAccount, pk)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class BillingAccountListDetail(GenericAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = BillingAccount.objects.all()
    serializer_class = BillingAccountSerializer

    def get(self, request, pk, format=None):
        items = self.get_queryset().filter(billing_plan=pk)
        serializer = self.serializer_class(items, many=True)
        return Response(serializer.data)

class PresetList(GenericAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [DjangoModelPermissions]
    queryset = Preset.objects.all()
    serializer_class = PresetSerializer

    def get(self, request, format=None):
        items = self.get_queryset()
        serializer = self.serializer_class(items, many=True)
        return Response(serializer.data)
    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PresetDetail(GenericAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [DjangoModelPermissions]
    queryset = Preset.objects.all()
    serializer_class = PresetSerializer

    def get(self, request, pk, format=None):
        item = get_object_by_pk(Preset, pk)
        serializer = self.serializer_class(item)
        return Response(serializer.data)
    def put(self, request, pk, format=None):
        item = get_object_by_pk(Preset, pk)
        serializer = self.serializer_class(item, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def delete(self, request, pk, format=None):
        item = get_object_by_pk(Preset, pk)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class TitleList(GenericAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [DjangoModelPermissions]
    queryset = Title.objects.all()
    serializer_class = TitleSerializer

    def get(self, request, format=None):
        items = self.get_queryset()
        serializer = self.serializer_class(items, many=True)
        return Response(serializer.data)
    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TitleDetail(GenericAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [DjangoModelPermissions]
    queryset = Title.objects.all()
    serializer_class = TitleSerializer

    def get(self, request, pk, format=None):
        item = get_object_by_pk(Title, pk)
        serializer = self.serializer_class(item)
        return Response(serializer.data)
    def put(self, request, pk, format=None):
        item = get_object_by_pk(Title, pk)
        serializer = self.serializer_class(item, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def delete(self, request, pk, format=None):
        item = get_object_by_pk(Title, pk)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class EntryList(GenericAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [DjangoModelPermissions]
    queryset = Entry.objects.all()
    serializer_class = EntrySerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        title_id = self.kwargs.get('title_id')
        if title_id:
            queryset = queryset.filter(title_id=title_id)
        return queryset

    def get(self, request, format=None):
        items = self.get_queryset().order_by('-paid_at')
        serializer = self.serializer_class(items, many=True)
        return Response(serializer.data)
    
    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            title_id = self.kwargs.get('title_id')
            if title_id:
                serializer.save(title_id=title_id)
            else:
                serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class EntryDetail(GenericAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [DjangoModelPermissions]
    queryset = Entry.objects.all()
    serializer_class = EntrySerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        title_id = self.kwargs.get('title_id')
        if title_id:
            queryset = queryset.filter(title_id=title_id)
        return queryset

    def get(self, request, pk, format=None):
        entry = self.get_object()
        serializer = self.serializer_class(entry)
        return Response(serializer.data)
    
    def put(self, request, pk, format=None):
        entry = self.get_object()
        serializer = self.serializer_class(entry, data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def patch(self, request, pk, format=None):
        entry = self.get_object()
        serializer = self.serializer_class(entry, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk, format=None):
        entry = self.get_object()
        entry.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class LogoutView(GenericAPIView):
    """
    View para fazer logout e invalidar o token do usuário.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, format=None):
        try:
            # Simplesmente deleta o token de autenticação do usuário
            request.user.auth_token.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            # Trata qualquer erro inesperado
            return Response(
                {"error": "Failed to logout"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )