from django.http import Http404
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from django.db.models import Sum, F
from django.db.models.functions import TruncMonth
from django.shortcuts import get_object_or_404
import collections   
from decimal import Decimal                             

from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import DjangoModelPermissions, IsAuthenticated
from django.core.exceptions import ValidationError
# Modelos Personalizados
from .models import Address, Company, BillingPlan, BillingAccount, Preset, Title, Entry, JournalLine 

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


class LedgerReportView(GenericAPIView):
    """
    Relatório de Razão Contábil
    GET /api/v1/reports/ledger/?company=<uuid>&start=YYYY-MM-DD&end=YYYY-MM-DD&account=<uuid>

    Base: lançamentos contábeis (JournalLine) do período, agrupados por conta contábil (BillingAccount).
    Mostra saldo inicial, movimentações e saldo acumulado.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        from .models import JournalEntry, JournalLine
        from datetime import datetime
        
        company_id = request.query_params.get('company')
        start = request.query_params.get('start')
        end = request.query_params.get('end')
        account_id = request.query_params.get('account')  # Filtro opcional por conta

        if not company_id or not start or not end:
            return Response(
                {"detail": "Parâmetros obrigatórios: company, start, end"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        # Converte strings de data para objetos datetime para garantir comparação correta
        try:
            start_date = datetime.strptime(start, '%Y-%m-%d').date()
            end_date = datetime.strptime(end, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {"detail": "Formato de data inválido. Use YYYY-MM-DD"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Busca todas as contas que têm movimentações no journal
        accounts_qs = BillingAccount.objects.filter(
            journal_lines__journal__company_id=company_id
        ).distinct()

        if account_id:
            accounts_qs = accounts_qs.filter(uuid=account_id)

        result = {
            'company': str(company_id),
            'start': start,
            'end': end,
            'accounts': []
        }

        # Para cada conta, calcula saldo inicial, movimentações e saldo final
        for account in accounts_qs.order_by('code'):
            # Lançamentos antes do período (para saldo inicial)
            lines_before = JournalLine.objects.filter(
                account=account,
                journal__company_id=company_id,
                journal__date__lt=start_date
            ).select_related('journal')

            # Lançamentos no período
            lines_period = JournalLine.objects.filter(
                account=account,
                journal__company_id=company_id,
                journal__date__gte=start_date,
                journal__date__lte=end_date
            ).select_related('journal').order_by('journal__date')

            # Determina natureza da conta baseado no uso nos presets
            def get_account_nature_from_presets(account):
                # Verifica se a conta é usada em presets para determinar natureza
                if account.payable_presets.exists() or account.receivable_presets.exists():
                    return 'ATIVO'  # Contas de controle (a receber/pagar)
                elif account.revenue_presets.exists():
                    return 'RECEITA'
                elif account.expense_presets.exists():
                    return 'DESPESA'
                else:
                    # Fallback: usa convenção de código se não estiver em preset
                    first_digit = (account.code or '1').split('.')[0]
                    nature_map = {
                        '1': 'ATIVO',
                        '2': 'PASSIVO', 
                        '3': 'RECEITA',
                        '4': 'DESPESA',
                        '5': 'PATRIMONIO'
                    }
                    return nature_map.get(first_digit, 'ATIVO')
            
            account_nature = get_account_nature_from_presets(account)
            
            # Calcula saldo inicial considerando natureza da conta
            initial_balance = 0.0
            for line in lines_before:
                debit = float(line.debit or 0)
                credit = float(line.credit or 0)
                if account_nature in ['ATIVO', 'DESPESA']:
                    initial_balance += debit - credit  # Natureza devedora
                else:
                    initial_balance += credit - debit  # Natureza credora

            # Processa movimentações do período
            movements = []
            accumulated_balance = initial_balance
            debit_total = 0.0
            credit_total = 0.0

            for line in lines_period:
                debit_amount = float(line.debit or 0)
                credit_amount = float(line.credit or 0)
                
                debit_total += debit_amount
                credit_total += credit_amount
                
                # Calcula saldo acumulado considerando natureza da conta
                if account_nature in ['ATIVO', 'DESPESA']:
                    accumulated_balance += debit_amount - credit_amount
                else:
                    accumulated_balance += credit_amount - debit_amount

                movements.append({
                    'date': line.journal.date.isoformat(),
                    'description': line.journal.description or line.memo,
                    'type': 'expense' if debit_amount > 0 else 'income',
                    'amount': str(debit_amount if debit_amount > 0 else credit_amount),
                    'debit': str(debit_amount),
                    'credit': str(credit_amount),
                    'accumulated_balance': str(accumulated_balance),
                    'payment_method': 'journal',
                    'entry_id': str(line.uuid),
                })

            # Prepara resposta da conta
            account_data = {
                'account_id': str(account.uuid),
                'code': account.code,
                'name': account.name,
                'account_type': account.account_type,
                'account_nature': account_nature,
                'initial_balance': str(initial_balance),
                'total_debits': str(debit_total),
                'total_credits': str(credit_total),
                'final_balance': str(accumulated_balance),
                'balance_type': 'devedor' if accumulated_balance >= 0 else 'credor',
                'movements_count': len(movements),
                'movements': movements,
            }

            result['accounts'].append(account_data)

        # Resumo consolidado
        total_debits = 0.0
        total_credits = 0.0
        for account in result['accounts']:
            total_debits += float(account['total_debits'])
            total_credits += float(account['total_credits'])

        result['summary'] = {
            'accounts_count': len(result['accounts']),
            'total_movements': sum(acc['movements_count'] for acc in result['accounts']),
            'total_debits': str(total_debits),
            'total_credits': str(total_credits),
            'net_result': str(total_debits - total_credits),  # Ajustado para contabilidade: débito - crédito
        }

        return Response(result)


class DREReportView(GenericAPIView):
    """
    Demonstração do Resultado do Exercício (DRE)
    GET /api/v1/reports/dre/?company=<uuid>&start=YYYY-MM-DD&end=YYYY-MM-DD&group=<account|month>

    Base: lançamentos contábeis (JournalLine) do período, classificados por natureza das contas.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        from .models import JournalEntry, JournalLine
        
        company_id = request.query_params.get('company')
        start = request.query_params.get('start')
        end = request.query_params.get('end')
        group = request.query_params.get('group')  # 'account' | 'month'

        if not company_id or not start or not end:
            return Response(
                {"detail": "Parâmetros obrigatórios: company, start, end"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Busca lançamentos do período
        lines_qs = JournalLine.objects.select_related('journal', 'account').filter(
            journal__company_id=company_id,
            journal__date__gte=start,
            journal__date__lte=end
        )

        # Calcula totais de receitas e despesas baseado na natureza das contas
        income_total = 0.0
        expense_total = 0.0
        
        for line in lines_qs:
            # Identifica receitas e despesas pela estrutura do código da conta
            code = line.account.code or ''
            first_level = code.split('.')[0] if code else ''
            
            # Convenção: códigos 3.x = Receitas, 4.x = Despesas
            if first_level == '3':  # Receitas
                income_total += float(line.credit or 0)
            elif first_level == '4':  # Despesas
                expense_total += float(line.debit or 0)
        
        result_total = income_total - expense_total

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

        # Detalhamento por dia baseado nos lançamentos contábeis
        details = {}
        for line in lines_qs.order_by('journal__date'):
            d = line.journal.date.strftime('%Y-%m-%d')
            if d not in details:
                details[d] = []
            
            code = line.account.code or ''
            first_level = code.split('.')[0] if code else ''
            
            # Determina tipo baseado na natureza da conta
            line_type = 'income' if first_level == '3' else 'expense' if first_level == '4' else 'other'
            amount = float(line.debit or 0) if line.debit > 0 else float(line.credit or 0)
            
            details[d].append({
                'paid_at': d,
                'type': line_type,
                'amount': str(amount),
                'payment_method': 'journal',
                'account_code': code,
                'account_name': line.account.name or '',
                'top_level': first_level,
                'title_desc': line.journal.description or line.memo,
            })
        result['details_by_day'] = details

        # Estrutura clássica DRE baseada na hierarquia de contas
        receita_total = income_total
        custos_variaveis = 0.0
        custos_fixos = 0.0
        investimentos = 0.0
        amortizacoes = 0.0

        # Classifica despesas por subcódigos (4.1 = variáveis, 4.2 = fixos, etc.)
        for line in lines_qs:
            code = line.account.code or ''
            parts = code.split('.')
            
            if len(parts) >= 2 and parts[0] == '4':  # Despesas
                val = float(line.debit or 0)
                
                if parts[1] == '1':  # 4.1.x = Custos Variáveis
                    custos_variaveis += val
                elif parts[1] == '2':  # 4.2.x = Custos Fixos
                    custos_fixos += val
                elif parts[1] == '3':  # 4.3.x = Investimentos
                    investimentos += val
                elif parts[1] == '4':  # 4.4.x = Amortizações
                    amortizacoes += val
                else:
                    # Default: considera como fixo
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

        # Quebra opcional por conta com hierarquia completa
        if group == 'account':
            breakdown = {}
            for line in lines_qs:
                code = line.account.code or 'N/A'
                key = code
                
                if key not in breakdown:
                    breakdown[key] = {
                        'code': code,
                        'name': line.account.name or 'Sem conta',
                        'income': 0.0,
                        'expense': 0.0,
                        'total': 0.0,
                    }
                
                # Soma débitos e créditos
                breakdown[key]['expense'] += float(line.debit or 0)
                breakdown[key]['income'] += float(line.credit or 0)
                breakdown[key]['total'] = breakdown[key]['income'] - breakdown[key]['expense']
            
            # Converte para strings
            result['by_account'] = [
                {
                    'code': v['code'],
                    'name': v['name'],
                    'income': str(v['income']),
                    'expense': str(v['expense']),
                    'total': str(v['total']),
                }
                for v in breakdown.values()
            ]

        # Quebra opcional por mês
        if group == 'month':
            from collections import OrderedDict
            agg = OrderedDict()
            
            for line in lines_qs:
                m = line.journal.date.strftime('%Y-%m')
                if m not in agg:
                    agg[m] = {'month': m, 'revenues': 0.0, 'expenses': 0.0, 'result': 0.0}
                
                code = line.account.code or ''
                first_level = code.split('.')[0] if code else ''
                
                if first_level == '3':  # Receitas
                    agg[m]['revenues'] += float(line.credit or 0)
                elif first_level == '4':  # Despesas
                    agg[m]['expenses'] += float(line.debit or 0)
                
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

class BalanceteReportView(GenericAPIView):
    """
    GET /reports/balancete/?billing_plan=<uuid>&company=<uuid>&start=YYYY-MM-DD&end=YYYY-MM-DD&include_zero=false
    """

    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        plan_id = request.query_params.get("billing_plan")
        company_id = request.query_params.get("company")   # 🔵 novo
        start = request.query_params.get("start")
        end = request.query_params.get("end")
        include_zero = request.query_params.get("include_zero", "false").lower() == "true"

        if not plan_id or not start or not end:
            return Response(
                {"detail": "Parâmetros obrigatórios: billing_plan, start, end"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        plan = get_object_or_404(BillingPlan, pk=plan_id)

        # 🔵 Valida empresa (se enviada)
        company = None
        if company_id:
            company = get_object_or_404(Company, pk=company_id)

        # 1) Carrega todas as contas do plano
        accounts_qs = BillingAccount.objects.filter(
            billing_plan=plan
        ).select_related("parent").order_by("code")

        accounts = list(accounts_qs)
        acct_by_id = {str(a.uuid): a for a in accounts}

        # Somas
        sums_by_account = collections.defaultdict(
            lambda: {"debit": Decimal("0.00"), "credit": Decimal("0.00")}
        )

        # 2) 🔵 Filtra lançamentos contábeis por empresa (se informado)
        jline_filters = {
            "journal__date__gte": start,
            "journal__date__lte": end,
            "account__billing_plan": plan,
        }

        if company:
            jline_filters["journal__company_id"] = company.uuid  # 🔵 filtro empresa

        jlines = (
            JournalLine.objects.filter(**jline_filters)
            .values("account")
            .annotate(total_debit=Sum("debit"), total_credit=Sum("credit"))
        )

        for row in jlines:
            acct_id = str(row["account"])
            debit = row["total_debit"] or Decimal("0.00")
            credit = row["total_credit"] or Decimal("0.00")
            sums_by_account[acct_id]["debit"] += Decimal(debit)
            sums_by_account[acct_id]["credit"] += Decimal(credit)

        # 3) Build tree
        Node = lambda: {
            "uuid": None,
            "code": "",
            "name": "",
            "debit": Decimal("0.00"),
            "credit": Decimal("0.00"),
            "balance": Decimal("0.00"),
            "children": [],
        }

        nodes = {}
        root_nodes = []

        for a in accounts:
            node = Node()
            node["uuid"] = str(a.uuid)
            node["code"] = a.code or ""
            node["name"] = a.name
            node["debit"] = sums_by_account.get(str(a.pk), {}).get(
                "debit", Decimal("0.00")
            )
            node["credit"] = sums_by_account.get(str(a.pk), {}).get(
                "credit", Decimal("0.00")
            )
            node["balance"] = node["debit"] - node["credit"]
            nodes[str(a.pk)] = node

        # attach children
        for a in accounts:
            node = nodes[str(a.pk)]
            if a.parent_id:
                nodes[str(a.parent_id)]["children"].append(node)
            else:
                root_nodes.append(node)

        # Bubble sums
        def aggregate(node):
            for child in node["children"]:
                aggregate(child)
                node["debit"] += child["debit"]
                node["credit"] += child["credit"]
            node["balance"] = node["debit"] - node["credit"]

        for rn in root_nodes:
            aggregate(rn)

        # prune zero
        def prune_zero(node):
            node["children"] = [c for c in node["children"] if prune_zero(c)]
            if (
                node["debit"] == Decimal("0.00")
                and node["credit"] == Decimal("0.00")
                and not node["children"]
            ):
                return include_zero
            return True

        if not include_zero:
            root_nodes = [r for r in root_nodes if prune_zero(r)]

        # serializar
        def fmt_node(node):
            return {
                "uuid": node["uuid"],
                "code": node["code"],
                "name": node["name"],
                "debit": f"{node['debit']:.2f}",
                "credit": f"{node['credit']:.2f}",
                "balance": f"{node['balance']:.2f}",
                "children": [fmt_node(c) for c in node["children"]],
            }

        result = {
            "billing_plan": str(plan.uuid),
            "company": str(company.uuid) if company else None,  # 🔵 retornando empresa
            "start": start,
            "end": end,
            "tree": [fmt_node(r) for r in root_nodes],
        }

        # Totais diretos
        total_debit = sum(v["debit"] for v in sums_by_account.values())
        total_credit = sum(v["credit"] for v in sums_by_account.values())

        result["totals"] = {
            "debits": f"{total_debit:.2f}",
            "credits": f"{total_credit:.2f}",
            "difference": f"{(total_debit - total_credit):.2f}",
        }

        return Response(result)
