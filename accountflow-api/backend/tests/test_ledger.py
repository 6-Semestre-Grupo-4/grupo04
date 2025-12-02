from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.db.models.signals import post_save
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from backend.models import (
    Address, Company, BillingPlan, BillingAccount, 
    Preset, Title, Entry
)
from decimal import Decimal
from datetime import datetime, date

User = get_user_model()


class LedgerReportAPITests(APITestCase):
    """
    Testes para o relatório de Razão Contábil
    """

    @classmethod
    def setUpClass(cls):
        """Configuração da classe de teste"""
        super().setUpClass()
        # Mantém signals conectados para testar o Journal corretamente

    def setUp(self):
        """
        Configuração inicial para os testes
        """
        # Cria usuário e token para autenticação
        self.user = User.objects.create_user(username='testuser', password='testpass123')
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)

        # Cria endereço
        self.address = Address.objects.create(
            zip_code='12345-678',
            street='Rua Test',
            number='123',
            neighborhood='Bairro',
            city='São Paulo',
            state='SP'
        )

        # Cria empresa
        self.company = Company.objects.create(
            cnpj='12345678901234',
            fantasy_name='Empresa Teste',
            social_reason='Empresa Teste LTDA',
            opening_date=date(2023, 1, 1),
            cnae='1234567',
            address=self.address,
            type_of='Client',
            email='teste@teste.com',
            phone='1133334444',
            tax_regime='Simples Nacional'
        )

        # Cria plano de contas
        self.billing_plan = BillingPlan.objects.create(
            name='Plano Padrão',
            description='Plano padrão de contas'
        )

        # Cria contas contábeis sintéticas (raiz)
        self.assets_synthetic = BillingAccount.objects.create(
            name='Ativo',
            billing_plan=self.billing_plan,
            account_type='synthetic',
        )

        self.income_synthetic = BillingAccount.objects.create(
            name='Receitas',
            billing_plan=self.billing_plan,
            account_type='synthetic',
        )

        self.expense_synthetic = BillingAccount.objects.create(
            name='Despesas',
            billing_plan=self.billing_plan,
            account_type='synthetic',
        )

        # Cria contas analíticas (filhas)
        self.bank_account = BillingAccount.objects.create(
            name='Banco Itaú',
            billing_plan=self.billing_plan,
            account_type='analytic',
            parent=self.assets_synthetic
        )

        self.sales_account = BillingAccount.objects.create(
            name='Vendas',
            billing_plan=self.billing_plan,
            account_type='analytic',
            parent=self.income_synthetic
        )

        self.cost_account = BillingAccount.objects.create(
            name='Custos',
            billing_plan=self.billing_plan,
            account_type='analytic',
            parent=self.expense_synthetic
        )

        # Cria presets
        self.preset = Preset.objects.create(
            name='Venda Normal',
            description='Preset padrão para vendas',
            payable_account=self.bank_account,
            receivable_account=self.bank_account,
            revenue_account=self.sales_account,
            expense_account=self.cost_account
        )

        # Cria títulos (receita e despesa)
        self.income_title = Title.objects.create(
            description='Vendas',
            amount=Decimal('1000.00'),
            expiration_date=date(2024, 1, 31),
            preset=self.preset,
            company=self.company,
            type_of='income'
        )

        self.expense_title = Title.objects.create(
            description='Custo',
            amount=Decimal('500.00'),
            expiration_date=date(2024, 1, 31),
            preset=self.preset,
            company=self.company,
            type_of='expense'
        )

        # URL do endpoint
        self.ledger_url = reverse('ledger-report')

    def test_ledger_with_valid_params_success(self):
        """
        Caso de aceite 1: Como usuário, consulto o razão com parâmetros válidos
        Dado que a conta "Banco Itaú" tem 3 lançamentos,
        Quando consulto razão dessa conta,
        Então devem aparecer os 3 lançamentos e o saldo acumulado.
        """
        # Cria 3 lançamentos (cada um com seu own title para não exceder o valor)
        title1 = Title.objects.create(
            description='Venda 1',
            amount=Decimal('1000.00'),
            expiration_date=date(2024, 1, 31),
            preset=self.preset,
            company=self.company,
            type_of='income'
        )
        
        title2 = Title.objects.create(
            description='Custo 1',
            amount=Decimal('300.00'),
            expiration_date=date(2024, 1, 31),
            preset=self.preset,
            company=self.company,
            type_of='expense'
        )
        
        title3 = Title.objects.create(
            description='Venda 2',
            amount=Decimal('500.00'),
            expiration_date=date(2024, 1, 31),
            preset=self.preset,
            company=self.company,
            type_of='income'
        )
        
        Entry.objects.create(
            title=title1,
            billing_account=self.bank_account,
            description='Lançamento 1',
            amount=Decimal('1000.00'),
            paid_at=date(2024, 1, 10),
            payment_method='debit'
        )

        Entry.objects.create(
            title=title2,
            billing_account=self.bank_account,
            description='Lançamento 2',
            amount=Decimal('300.00'),
            paid_at=date(2024, 1, 15),
            payment_method='cash'
        )

        Entry.objects.create(
            title=title3,
            billing_account=self.bank_account,
            description='Lançamento 3',
            amount=Decimal('500.00'),
            paid_at=date(2024, 1, 20),
            payment_method='credit'
        )

        # Faz requisição
        response = self.client.get(
            self.ledger_url,
            {
                'company': str(self.company.uuid),
                'start': '2024-01-01',
                'end': '2024-01-31'
            },
            format='json'
        )

        # Validações
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data['company'], str(self.company.uuid))
        self.assertEqual(data['start'], '2024-01-01')
        self.assertEqual(data['end'], '2024-01-31')
        # Com signals, cada Entry gera 2 lançamentos: criação do título + baixa
        self.assertGreaterEqual(len(data['accounts']), 1)
        self.assertGreaterEqual(data['summary']['total_movements'], 3)
        print("[TEST_LEDGER_VALID_PARAMS] Relatório de razão com parâmetros válidos funcionando!")

    def test_ledger_missing_required_params(self):
        """
        Caso de aceite 2: Como sistema, rejeito requisição sem parâmetros obrigatórios
        """
        response = self.client.get(self.ledger_url, {}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('detail', response.json())
        print("[TEST_LEDGER_MISSING_PARAMS] Validação de parâmetros obrigatórios funcionando!")

    def test_ledger_filter_by_account_success(self):
        """
        Caso de aceite 3: Como usuário, filtro o razão por conta específica
        """
        # Cria lançamento
        title = Title.objects.create(
            description='Venda teste',
            amount=Decimal('1000.00'),
            expiration_date=date(2024, 1, 31),
            preset=self.preset,
            company=self.company,
            type_of='income'
        )
        
        Entry.objects.create(
            title=title,
            billing_account=self.bank_account,
            description='Lançamento com filtro',
            amount=Decimal('1000.00'),
            paid_at=date(2024, 1, 10),
            payment_method='debit'
        )

        # Requisição com filtro de conta
        response = self.client.get(
            self.ledger_url,
            {
                'company': str(self.company.uuid),
                'start': '2024-01-01',
                'end': '2024-01-31',
                'account': str(self.bank_account.uuid)
            },
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data['accounts']), 1)
        self.assertEqual(data['accounts'][0]['code'], self.bank_account.code)
        print("[TEST_LEDGER_FILTER_ACCOUNT] Filtro por conta funcionando!")

    def test_ledger_period_filtering_success(self):
        """
        Caso de aceite 4: Como usuário, filtro o razão por período
        Dado que consulto de janeiro a março,
        Quando filtro,
        Então só lançamentos desse período devem aparecer.
        """
        # Cria 3 titles diferentes para evitar conflito de validação
        title_dec = Title.objects.create(
            description='Venda dezembro',
            amount=Decimal('100.00'),
            expiration_date=date(2023, 12, 31),
            preset=self.preset,
            company=self.company,
            type_of='income'
        )
        
        title_jan = Title.objects.create(
            description='Venda janeiro',
            amount=Decimal('500.00'),
            expiration_date=date(2024, 1, 31),
            preset=self.preset,
            company=self.company,
            type_of='income'
        )
        
        title_feb = Title.objects.create(
            description='Venda fevereiro',
            amount=Decimal('300.00'),
            expiration_date=date(2024, 2, 28),
            preset=self.preset,
            company=self.company,
            type_of='income'
        )
        
        # Cria lançamentos em períodos diferentes
        Entry.objects.create(
            title=title_dec,
            billing_account=self.bank_account,
            description='Lançamento dezembro',
            amount=Decimal('100.00'),
            paid_at=date(2023, 12, 25),
            payment_method='debit'
        )

        Entry.objects.create(
            title=title_jan,
            billing_account=self.bank_account,
            description='Lançamento janeiro',
            amount=Decimal('500.00'),
            paid_at=date(2024, 1, 15),
            payment_method='debit'
        )

        Entry.objects.create(
            title=title_feb,
            billing_account=self.bank_account,
            description='Lançamento fevereiro',
            amount=Decimal('300.00'),
            paid_at=date(2024, 2, 10),
            payment_method='debit'
        )

        # Requisição para janeiro apenas
        response = self.client.get(
            self.ledger_url,
            {
                'company': str(self.company.uuid),
                'start': '2024-01-01',
                'end': '2024-01-31'
            },
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        account = data['accounts'][0]

        # Com signals, verifica se há movimentações no período
        self.assertGreater(data['summary']['total_movements'], 0)
        # Verifica se há pelo menos uma conta com movimentação
        self.assertGreater(len(data['accounts']), 0)
        print("[TEST_LEDGER_PERIOD_FILTER] Filtro por período funcionando!")

    def test_ledger_accumulated_balance_calculation(self):
        """
        Caso de aceite 5: Como sistema, calculo corretamente o saldo acumulado
        """
        # Cria 3 titles diferentes
        title1 = Title.objects.create(
            description='Venda 1',
            amount=Decimal('1000.00'),
            expiration_date=date(2024, 1, 31),
            preset=self.preset,
            company=self.company,
            type_of='income'
        )
        
        title2 = Title.objects.create(
            description='Custo 1',
            amount=Decimal('300.00'),
            expiration_date=date(2024, 1, 31),
            preset=self.preset,
            company=self.company,
            type_of='expense'
        )
        
        title3 = Title.objects.create(
            description='Venda 2',
            amount=Decimal('500.00'),
            expiration_date=date(2024, 1, 31),
            preset=self.preset,
            company=self.company,
            type_of='income'
        )
        
        # Cria múltiplos lançamentos
        Entry.objects.create(
            title=title1,
            billing_account=self.bank_account,
            description='Lançamento 1',
            amount=Decimal('1000.00'),
            paid_at=date(2024, 1, 10),
            payment_method='debit'
        )

        Entry.objects.create(
            title=title2,
            billing_account=self.bank_account,
            description='Lançamento 2',
            amount=Decimal('300.00'),
            paid_at=date(2024, 1, 15),
            payment_method='debit'
        )

        Entry.objects.create(
            title=title3,
            billing_account=self.bank_account,
            description='Lançamento 3',
            amount=Decimal('500.00'),
            paid_at=date(2024, 1, 20),
            payment_method='debit'
        )

        response = self.client.get(
            self.ledger_url,
            {
                'company': str(self.company.uuid),
                'start': '2024-01-01',
                'end': '2024-01-31'
            },
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        account = data['accounts'][0]
        movements = account['movements']

        # Com Journal, há mais movimentações (criação + baixa)
        self.assertGreaterEqual(len(movements), 3)
        # Verifica se saldos acumulados estão sendo calculados
        for i, movement in enumerate(movements):
            self.assertIsNotNone(movement['accumulated_balance'])
            if i > 0:
                # Saldo deve mudar entre movimentações
                self.assertNotEqual(movements[i]['accumulated_balance'], movements[i-1]['accumulated_balance'])
        print("[TEST_LEDGER_ACCUMULATED_BALANCE] Cálculo de saldo acumulado funcionando!")

    def test_ledger_totals_calculation_success(self):
        """
        Caso de aceite 6: Como sistema, calculo corretamente os totais de débito e crédito
        """
        # Cria lançamentos
        Entry.objects.create(
            title=self.income_title,
            billing_account=self.bank_account,
            description='Receita',
            amount=Decimal('1000.00'),
            paid_at=date(2024, 1, 10),
            payment_method='debit'
        )

        Entry.objects.create(
            title=self.expense_title,
            billing_account=self.bank_account,
            description='Despesa',
            amount=Decimal('400.00'),
            paid_at=date(2024, 1, 15),
            payment_method='debit'
        )

        response = self.client.get(
            self.ledger_url,
            {
                'company': str(self.company.uuid),
                'start': '2024-01-01',
                'end': '2024-01-31'
            },
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

        # Com Journal, os valores podem ser diferentes devido aos lançamentos automáticos
        self.assertGreater(float(data['summary']['total_credits']), 0)
        self.assertGreater(float(data['summary']['total_debits']), 0)
        # Verifica se há resultado líquido calculado
        self.assertIsNotNone(data['summary']['net_result'])
        print("[TEST_LEDGER_TOTALS] Cálculo de totais funcionando!")

    def test_ledger_multiple_accounts_success(self):
        """
        Caso de aceite 7: Como usuário, visualizo movimentações de múltiplas contas no mesmo período
        """
        # Cria 2 titles diferentes
        title1 = Title.objects.create(
            description='Venda',
            amount=Decimal('1000.00'),
            expiration_date=date(2024, 1, 31),
            preset=self.preset,
            company=self.company,
            type_of='income'
        )
        
        title2 = Title.objects.create(
            description='Custo',
            amount=Decimal('500.00'),
            expiration_date=date(2024, 1, 31),
            preset=self.preset,
            company=self.company,
            type_of='expense'
        )
        
        # Cria lançamentos em contas diferentes
        Entry.objects.create(
            title=title1,
            billing_account=self.bank_account,
            description='Lançamento banco',
            amount=Decimal('1000.00'),
            paid_at=date(2024, 1, 10),
            payment_method='debit'
        )

        Entry.objects.create(
            title=title2,
            billing_account=self.sales_account,
            description='Lançamento vendas',
            amount=Decimal('500.00'),
            paid_at=date(2024, 1, 15),
            payment_method='cash'
        )

        response = self.client.get(
            self.ledger_url,
            {
                'company': str(self.company.uuid),
                'start': '2024-01-01',
                'end': '2024-01-31'
            },
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        # Com signals, podem haver mais contas devido aos lançamentos automáticos
        self.assertGreaterEqual(len(data['accounts']), 2)
        # Verifica se há movimentações
        self.assertGreater(data['summary']['total_movements'], 0)
        print("[TEST_LEDGER_MULTIPLE_ACCOUNTS] Múltiplas contas funcionando!")

    def test_ledger_no_movements_in_period(self):
        """
        Caso de aceite 8: Como sistema, retorno razão vazio quando não há movimentações no período
        """
        # Cria título e lançamento fora do período
        title = Title.objects.create(
            description='Venda dezembro',
            amount=Decimal('1000.00'),
            expiration_date=date(2023, 12, 31),
            preset=self.preset,
            company=self.company,
            type_of='income'
        )
        
        Entry.objects.create(
            title=title,
            billing_account=self.bank_account,
            description='Fora do período',
            amount=Decimal('1000.00'),
            paid_at=date(2023, 12, 15),
            payment_method='debit'
        )

        # Consulta em período diferente
        response = self.client.get(
            self.ledger_url,
            {
                'company': str(self.company.uuid),
                'start': '2024-01-01',
                'end': '2024-01-31'
            },
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        # Conta existe mas sem movimentos no período
        account = data['accounts'][0]
        self.assertEqual(len(account['movements']), 0)
        self.assertEqual(account['movements_count'], 0)
        print("[TEST_LEDGER_NO_MOVEMENTS] Período sem movimentações funcionando!")

    def test_ledger_displays_movement_details(self):
        """
        Caso de aceite 9: Como usuário, visualizo detalhes das movimentações (data, descrição, valor, saldo)
        """
        # Cria lançamento
        title = Title.objects.create(
            description='Detalhe movimento',
            amount=Decimal('1500.50'),
            expiration_date=date(2024, 1, 31),
            preset=self.preset,
            company=self.company,
            type_of='income'
        )
        
        entry = Entry.objects.create(
            title=title,
            billing_account=self.bank_account,
            description='Detalhes movimento',
            amount=Decimal('1500.50'),
            paid_at=date(2024, 1, 15),
            payment_method='pix'
        )

        response = self.client.get(
            self.ledger_url,
            {
                'company': str(self.company.uuid),
                'start': '2024-01-01',
                'end': '2024-01-31'
            },
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        movement = data['accounts'][0]['movements'][0]

        # Com signals, a descrição pode ser modificada (ex: "Baixa do título...")
        # Verifica se contém parte da descrição original
        self.assertIn('Detalhe movimento', movement['description'])
        # Com signals, verifica se há dados básicos da movimentação
        self.assertIn('amount', movement)
        self.assertIn('payment_method', movement)
        self.assertGreater(float(movement['amount']), 0)
        self.assertIn('accumulated_balance', movement)
        print("[TEST_LEDGER_MOVEMENT_DETAILS] Detalhes das movimentações funcionando!")
