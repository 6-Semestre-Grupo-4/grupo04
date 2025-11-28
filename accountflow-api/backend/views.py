from django.http import Http404
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from django.db.models import Sum, F
from django.db.models.functions import TruncMonth

from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import DjangoModelPermissions, IsAuthenticated
from django.core.exceptions import ValidationError
# Modelos Personalizados
from .models import Address, Company, BillingPlan, BillingAccount, Preset, Title, Entry

from .serializers import AddressSerializer, CompanySerializer, BillingPlanSerializer, BillingAccountSerializer, PresetSerializer, TitleSerializer, EntrySerializer

def get_object_by_pk(model, pk):
    try:
        return model.objects.get(pk=pk)
    except model.DoesNotExist:
        raise Http404

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class AddressList(GenericAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [DjangoModelPermissions]
    queryset = Address.objects.all()
    serializer_class = AddressSerializer
    pagination_class = StandardResultsSetPagination

    def get(self, request, format=None):
        items = self.get_queryset()
        page = self.paginate_queryset(items)
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)
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
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        return super().get_queryset().select_related('address').order_by('fantasy_name')

    def get(self, request, format=None):
        items = self.get_queryset()
        # Se o parâmetro 'no_pagination' estiver presente, retorna lista completa
        if request.query_params.get('no_pagination') == 'true':
            serializer = self.serializer_class(items, many=True)
            return Response(serializer.data)
        
        # Caso contrário, retorna paginado
        page = self.paginate_queryset(items)
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)
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
    pagination_class = StandardResultsSetPagination
    
    def get(self, request, format=None):
        items = self.get_queryset().order_by('name')
        page = self.paginate_queryset(items)
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)
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
        from django.db.models.deletion import ProtectedError 
        item = get_object_by_pk(BillingPlan, pk)
        try:
            item.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProtectedError as e:
            return Response({"error": "Registro possui dependências e não pode ser excluído."}, status=400)

class BillingAccountList(GenericAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [DjangoModelPermissions]
    queryset = BillingAccount.objects.all()
    serializer_class = BillingAccountSerializer
    pagination_class = StandardResultsSetPagination
    
    def get(self, request, format=None):
        items = self.get_queryset().select_related('billing_plan', 'parent').order_by('code')
        page = self.paginate_queryset(items)
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)
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
        from django.db.models.deletion import ProtectedError 
        item = get_object_by_pk(BillingAccount, pk)
        try:
            item.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProtectedError as e:
            return Response({"error": "Registro possui dependências e não pode ser excluído."}, status=400)

class BillingAccountListDetail(GenericAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [DjangoModelPermissions]
    queryset = BillingAccount.objects.all()
    serializer_class = BillingAccountSerializer
    pagination_class=  None

    def get(self, request, pk, format=None):
        items = self.get_queryset().filter(billing_plan_id=pk).select_related('billing_plan', 'parent').order_by('code')
        serializer = self.serializer_class(items, many=True)
        return Response(serializer.data)

class PresetList(GenericAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [DjangoModelPermissions]
    queryset = Preset.objects.all()
    serializer_class = PresetSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        return super().get_queryset().select_related(
            'payable_account__billing_plan',
            'receivable_account__billing_plan',
            'revenue_account__billing_plan',
            'expense_account__billing_plan',
        )

    def get(self, request, format=None):
        items = self.get_queryset().order_by('-created_at')
        page = self.paginate_queryset(items)
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)
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
        from django.db.models.deletion import ProtectedError 
        item = get_object_by_pk(Preset, pk)
        try:
            item.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProtectedError as e:
            return Response({"error": "Registro possui dependências e não pode ser excluído."}, status=400)

class TitleList(GenericAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [DjangoModelPermissions]
    queryset = Title.objects.all()
    serializer_class = TitleSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        return super().get_queryset().select_related(
            'preset',
            'company',
        )

    def get(self, request, format=None):
        items = self.get_queryset().order_by('-created_at') 
        page = self.paginate_queryset(items)
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.serializer_class(items, many=True)
        return Response(serializer.data)
    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            try:
                instance = serializer.save()
            except ValidationError as e:
                data = getattr(e, 'message_dict', None) or {'detail': e.messages if hasattr(e, 'messages') else str(e)}
                return Response(data, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            return Response(self.serializer_class(instance).data, status=status.HTTP_201_CREATED)
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
        from django.db.models.deletion import ProtectedError 
        item = get_object_by_pk(Title, pk)
        try:
            item.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProtectedError as e:
            return Response({"error": "Registro possui dependências e não pode ser excluído."}, status=400)

class EntryList(GenericAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [DjangoModelPermissions]
    queryset = Entry.objects.all()
    serializer_class = EntrySerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        queryset = super().get_queryset().select_related('title', 'billing_account')
        title_id = self.kwargs.get('title_id')
        if title_id:
            queryset = queryset.filter(title_id=title_id)
        return queryset

    def get(self, request, title_id=None, format=None):
        qs = self.get_queryset()
        items = qs.order_by('-paid_at')
        page = self.paginate_queryset(items)
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)
            
        serializer = self.serializer_class(items, many=True)
        return Response(serializer.data)
    
    def post(self, request, title_id=None, format=None):
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
        queryset = super().get_queryset().select_related('title', 'billing_account')
        title_id = self.kwargs.get('title_id')
        if title_id:
            queryset = queryset.filter(title_id=title_id)
        return queryset

    def get(self, request, pk, title_id=None, format=None):
        entry = self.get_object()
        serializer = self.serializer_class(entry)
        return Response(serializer.data)
    
    def put(self, request, pk, title_id=None, format=None):
        entry = self.get_object()
        serializer = self.serializer_class(entry, data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def patch(self, request, pk, title_id=None, format=None):
        entry = self.get_object()
        serializer = self.serializer_class(entry, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk, title_id=None, format=None):
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
        token = getattr(request.user, "auth_token", None)
        if token:
            token.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class DREReportView(GenericAPIView):
    """
    Demonstração do Resultado do Exercício (DRE)
    GET /api/v1/reports/dre/?company=<uuid>&start=YYYY-MM-DD&end=YYYY-MM-DD&group=<account|month>

    Base: entradas (Entry) liquidadas no período (paid_at), classificadas por Title.type_of (income/expense).
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        company_id = request.query_params.get('company')
        start = request.query_params.get('start')
        end = request.query_params.get('end')
        group = request.query_params.get('group')  # 'account' | 'month'

        if not company_id or not start or not end:
            return Response(
                {"detail": "Parâmetros obrigatórios: company, start, end"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        qs = (
            Entry.objects.select_related('title', 'billing_account')
            .filter(title__company_id=company_id, paid_at__gte=start, paid_at__lte=end)
        )

        # Totais por tipo (income/expense)
        totals_by_type = (
            qs.values('title__type_of')
            .annotate(total=Sum('amount'))
        )
        income_total = sum(x['total'] or 0 for x in totals_by_type if x['title__type_of'] == 'income')
        expense_total = sum(x['total'] or 0 for x in totals_by_type if x['title__type_of'] == 'expense')
        result_total = (income_total or 0) - (expense_total or 0)

        result = {
            'company': str(company_id),
            'start': start,
            'end': end,
            'totals': {
                'revenues': str(income_total),
                'expenses': str(expense_total),
                'result': str(result_total),
            },
        }

        # Detalhamento por dia (lista de entradas pagas com contexto)
        # Estrutura: { 'YYYY-MM-DD': [ { paid_at, type, amount, payment_method, account_code, account_name, top_level, title_desc } ] }
        details = {}
        for e in qs.values(
            'paid_at',
            'amount',
            'payment_method',
            'billing_account__code',
            'billing_account__name',
            'title__type_of',
            'title__description',
        ).order_by('paid_at'):
            d = e['paid_at'].strftime('%Y-%m-%d')
            if d not in details:
                details[d] = []
            code = e['billing_account__code'] or ''
            top_level = code.split('.')[0] if code else ''
            details[d].append({
                'paid_at': d,
                'type': e['title__type_of'],
                'amount': str(e['amount']),
                'payment_method': e['payment_method'],
                'account_code': code,
                'account_name': e['billing_account__name'] or '',
                'top_level': top_level,
                'title_desc': e['title__description'] or '',
            })
        result['details_by_day'] = details

        # Estrutura clássica DRE (heurística baseada em nomes/códigos de contas)
        # Identificação simples: variáveis (CMV/CMA, impostos, taxas), fixos (salários, aluguel, energia, internet, manutenção etc),
        # investimentos e amortizações por nomes de conta.
        def normalize(s):
            return (s or '').lower()

        variable_keywords = [
            'cmv', 'cma', 'custo de mercadoria', 'custo de matéria', 'simples', 'imposto', 'taxa', 'cartão', 'administracao de cartoes', 'administracao de cartões'
        ]
        fixed_keywords = [
            'salário', 'salarios', 'encargo', 'pró-labore', 'pro-labore', 'contador', 'energia', 'água', 'agua', 'aluguel', 'juros', 'manutenção', 'segurança', 'telefone', 'internet', 'vale transporte'
        ]
        invest_keywords = ['investimento', 'imobilizado', 'equipamento', 'veículo', 'veiculo']
        amort_keywords = ['amortização', 'amortizacao', 'depreciação', 'depreciacao']

        receita_total = float(income_total or 0)
        custos_variaveis = 0.0
        custos_fixos = 0.0
        investimentos = 0.0
        amortizacoes = 0.0

        # Percorre entradas de despesas para classificar
        for e in qs.values('amount', 'billing_account__name', 'billing_account__code', 'title__type_of'):
            if e['title__type_of'] != 'expense':
                continue
            name = normalize(e['billing_account__name'])
            code = normalize(e['billing_account__code'])
            val = float(e['amount'] or 0)

            if any(k in name for k in variable_keywords) or any(k in code for k in variable_keywords):
                custos_variaveis += val
            elif any(k in name for k in fixed_keywords) or any(k in code for k in fixed_keywords):
                custos_fixos += val
            elif any(k in name for k in invest_keywords) or any(k in code for k in invest_keywords):
                investimentos += val
            elif any(k in name for k in amort_keywords) or any(k in code for k in amort_keywords):
                amortizacoes += val
            else:
                # Default: considera como fixo para não perder controle
                custos_fixos += val

        margem_contribuicao = receita_total - custos_variaveis
        resultado_operacional = margem_contribuicao - custos_fixos
        resultado_final = resultado_operacional - investimentos - amortizacoes

        result['classic'] = {
            'receita_total': str(receita_total),
            'custos_variaveis': str(custos_variaveis),
            'margem_contribuicao': str(margem_contribuicao),
            'custos_fixos': str(custos_fixos),
            'resultado_operacional_liquido': str(resultado_operacional),
            'investimentos': str(investimentos),
            'amortizacoes': str(amortizacoes),
            'resultado_final': str(resultado_final),
        }

        # Quebra opcional por conta (usa o primeiro nível do código, se existir)
        if group == 'account':
            breakdown = {}
            for e in qs.values('billing_account__code', 'billing_account__name', 'title__type_of').annotate(total=Sum('amount')):
                code = e['billing_account__code'] or 'N/A'
                top_level = code.split('.')[0] if code else 'N/A'
                key = f"{top_level}"
                if key not in breakdown:
                    breakdown[key] = {
                        'code': top_level,
                        'name': e['billing_account__name'] if e['billing_account__name'] else 'Sem conta',
                        'income': '0',
                        'expense': '0',
                        'total': '0',
                    }
                if e['title__type_of'] == 'income':
                    breakdown[key]['income'] = str((float(breakdown[key]['income']) if breakdown[key]['income'] else 0) + float(e['total'] or 0))
                else:
                    breakdown[key]['expense'] = str((float(breakdown[key]['expense']) if breakdown[key]['expense'] else 0) + float(e['total'] or 0))
                breakdown[key]['total'] = str(float(breakdown[key]['income']) - float(breakdown[key]['expense']))
            result['by_account'] = list(breakdown.values())

        # Quebra opcional por mês
        if group == 'month':
            monthly = (
                qs.annotate(month=TruncMonth('paid_at'))
                .values('month', 'title__type_of')
                .annotate(total=Sum('amount'))
                .order_by('month')
            )
            # Agrega em linhas mês a mês
            from collections import OrderedDict
            agg = OrderedDict()
            for row in monthly:
                m = row['month'].strftime('%Y-%m') if row['month'] else 'unknown'
                if m not in agg:
                    agg[m] = {'month': m, 'revenues': 0.0, 'expenses': 0.0, 'result': 0.0}
                if row['title__type_of'] == 'income':
                    agg[m]['revenues'] += float(row['total'] or 0)
                else:
                    agg[m]['expenses'] += float(row['total'] or 0)
                agg[m]['result'] = agg[m]['revenues'] - agg[m]['expenses']
            result['monthly'] = [
                {
                    'month': v['month'],
                    'revenues': str(v['revenues']),
                    'expenses': str(v['expenses']),
                    'result': str(v['result']),
                }
                for v in agg.values()
            ]

        return Response(result)
