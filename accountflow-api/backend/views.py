from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


# Modelos Personalizados
from .models import Person, Company

from .serializers import PersonSerializer

def get_object_by_pk(model, pk):
    try:
        return model.objects.get(pk=pk)
    except model.DoesNotExist:
        raise Http404

class PersonList(APIView):
    def get(self, request, format=None):
        items = Person.objects.all()
        serializer = PersonSerializer(items, many=True)
        return Response(serializer.data)
    def post(self, request, format=None):
        data = request.data.copy()
        company_cnpj = data.get('company_cnpj')

        if not company_cnpj:
            return Response({'error': 'O campo company_cnpj é obrigatório.'}, status=status.HTTP_400_BAD_REQUEST)

        company = Company.objects.filter(cnpj=company_cnpj).first()
        if not company:
            return Response({'error': 'Empresa com o CNPJ fornecido não encontrada.'}, status=status.HTTP_400_BAD_REQUEST)

        # adiciona o ID da empresa antes de criar o serializer
        data['company'] = company.id

        serializer = PersonSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PersonDetail(APIView):
    def get(self, request, pk, format=None):
        item = get_object_by_pk(Person, pk)
        serializer = PersonSerializer(item)
        return Response(serializer.data)
    def put(self, request, pk, format=None):
        item = get_object_by_pk(Person, pk)
        serializer = PersonSerializer(item, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def delete(self, request, pk, format=None):
        item = get_object_by_pk(Person, pk)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)