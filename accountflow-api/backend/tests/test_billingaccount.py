from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from backend.models import BillingAccount, BillingPlan, Company, Address
from datetime import date
import uuid

class BillingAccountAPITests(APITestCase):
    def setUp(self):
        """
        Payload de configuração de teste
        """

        self.address = Address.objects.create(
            street="Rua Exemplo",
            number="123",
            city="Toledo",
            state="PR",
            zip_code="85900000"
        )

        self.company = Company.objects.create(
            fantasy_name="Beleza Rara",
            social_reason="Beleza Rara LTDA",
            cnpj="12345678000199",
            email="contato@belezarara.com",
            phone="44999887766",
            opening_date=date.today(),
            type_of="Client",
            address=self.address
        )

        self.plan = BillingPlan.objects.create(
            name="Plano Contábil Base",
            description="Plano base para testes"
        )

        # Conta sintética (nível 1)
        self.root_account = BillingAccount.objects.create(
            name="Ativo",
            company=self.company,
            billing_plan=self.plan,
            account_type=BillingAccount.AccountType.SYNTHETIC
        )

        # URLs
        self.list_url = reverse("billing-account-list")
        self.detail_url = reverse("billing-account-detail", kwargs={"pk": self.root_account.uuid})

        # Payloads
        self.valid_payload = {
            "name": "Caixa",
            "company": str(self.company.uuid),
            "billing_plan": str(self.plan.uuid),
            "parent": str(self.root_account.uuid),
            "account_type": BillingAccount.AccountType.ANALYTIC,
            "is_active": True,
        }

        self.invalid_payload = {
            "name": "",  
            "company": str(self.company.uuid),
            "billing_plan": str(self.plan.uuid),
            "parent": str(self.root_account.uuid),
            "account_type": BillingAccount.AccountType.ANALYTIC,
            "is_active": True,
        }

    def test_create_billing_account_success(self):
        """
        Caso de aceite 1: Como usuário do sistema, desejo cadastrar uma conta contábil analítica.
        """
        response = self.client.post(self.list_url, self.valid_payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(BillingAccount.objects.count(), 2)
        self.assertEqual(response.data["name"], "Caixa")
        print("[TEST_CREATE] Conta contábil criada com sucesso!")

    def test_create_billing_account_invalid_payload(self):
        """
        Caso de aceite 2: Como sistema, devo rejeitar contas contábeis com nome vazio.
        """
        response = self.client.post(self.list_url, self.invalid_payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(BillingAccount.objects.count(), 1)
        print("[TEST_INVALID_CREATE] Validação de nome vazio funcionando!")

    def test_get_billing_account_detail_success(self):
        """
        Critério de aceite 3: Como usuário, desejo consultar uma conta contábil pelo seu ID.
        """
        response = self.client.get(self.detail_url, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["uuid"], str(self.root_account.uuid))
        print("[TEST_GET_DETAIL] Consulta de conta contábil bem-sucedida!")

    def test_get_billing_account_detail_not_found(self):
        """
        Critério de aceite 4: Como sistema, devo retornar 404 NOT FOUND para UUID inexistente.
        """
        fake_uuid = uuid.uuid4()
        url = reverse("billing-account-detail", kwargs={"pk": fake_uuid})
        response = self.client.get(url, format="json")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        print("[TEST_NOT_FOUND] Recurso inexistente tratado corretamente!")

    def test_update_billing_account_success(self):
        """
        Critério de aceite 5: Como usuário, desejo atualizar o nome de uma conta contábil.
        """
        update_payload = {
            "name": "Ativo Circulante",
            "company": str(self.company.uuid),
            "billing_plan": str(self.plan.uuid),
            "parent": None,
            "account_type": BillingAccount.AccountType.SYNTHETIC,
            "is_active": True,
        }

        response = self.client.put(self.detail_url, update_payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Ativo Circulante")
        print("[TEST_UPDATE] Atualização de conta contábil realizada com sucesso!")

    def test_delete_billing_account_success(self):
        """
        Critério de aceite 6: Como usuário, desejo deletar uma conta contábil sem vínculos dependentes.
        Obs: Deverá colocar como protect no lançamento para impedir de excluir conta que tenha lançamento
        """
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(BillingAccount.objects.count(), 0)
        print("[TEST_DELETE] Exclusão de conta contábil executada com sucesso!")
    
    def test_create_analytic_account_without_parent_fails(self):
        """
        Critério 7: Como sistema, devo recusar a criação de uma conta analítica sem conta pai.
        """
        print("[ESCREVER_TEST_7] Escrever teste para validar criação de conta analítica sem pai (esperado 400).")
        pass

    def test_create_account_with_parent_from_other_company_fails(self):
        """
        Critério 8: Como sistema, devo recusar a criação de uma conta cuja conta pai pertence a outra empresa.
        """
        print("[ESCREVER_TEST_8] Escrever teste para validar empresa diferente entre conta e conta pai (esperado 400).")
        pass

    def test_create_account_with_parent_from_other_plan_fails(self):
        """
        Critério 9: Como sistema, devo recusar a criação de uma conta cuja conta pai pertence a outro plano de contas.
        """
        print("[ESCREVER_TEST_9] Escrever teste para validar plano contábil diferente entre conta e conta pai (esperado 400).")
        pass

    def test_create_account_with_parent_analytic_fails(self):
        """
        Critério 10: Como sistema, devo recusar a criação de uma conta filha cuja conta pai é analítica.
        """
        print("[ESCREVER_TEST_10] Escrever teste para impedir conta analítica ser pai (esperado 400).")
        pass

    def test_create_account_exceeding_max_depth_fails(self):
        """
        Critério 11: Como sistema, devo impedir a criação de uma conta no 6º nível hierárquico.
        """
        print("[ESCREVER_TEST_11] Escrever teste para validar profundidade máxima de 5 níveis (esperado 400).")
        pass

    def test_code_is_generated_automatically_on_creation(self):
        """
        Critério 12: Como sistema, ao criar uma conta contábil, devo gerar automaticamente um código hierárquico (ex: 1.01.001).
        """
        print("[ESCREVER_TEST_12] Escrever teste para garantir que o campo code é gerado automaticamente (esperado 201 + código presente).")
        pass

    def test_is_active_flag_does_not_delete_account(self):
        """
        Critério 13: Como sistema, ao marcar uma conta como inativa, ela deve continuar existindo no banco.
        """
        print("[ESCREVER_TEST_13] Escrever teste para garantir que 'is_active=False' não apaga a conta (esperado 200).")
        pass

    def test_delete_parent_account_cascades_to_children(self):
        """
        Critério 14: Como sistema, ao deletar uma conta pai, devo deletar automaticamente todas as contas filhas.
        """
        print("[ESCREVER_TEST_14] Escrever teste para validar exclusão em cascata (esperado 204 + sem filhos).")
        pass

    def test_duplicate_account_name_under_same_parent_fails(self):
        """
        Critério 15: Como sistema, devo impedir a criação de duas contas com o mesmo nome sob o mesmo pai e plano.
        """
        print("[ESCREVER_TEST_15] Escrever teste para garantir unicidade de nome dentro do mesmo plano e pai (esperado 400).")
        pass

