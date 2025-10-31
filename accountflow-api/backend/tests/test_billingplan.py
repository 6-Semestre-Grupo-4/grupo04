from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from backend.models import BillingPlan
import uuid

class BillingPlanAPITests(APITestCase):
    def setUp(self):
        """
        Payload de configuraçãod de teste
        """

        self.plan1 = BillingPlan.objects.create(name="Plano Teste", description="Este é um plano teste")

        self.list_url = reverse('billing-plan-list')
        self.detail_url = reverse('billing-plan-detail', kwargs={'pk':self.plan1.uuid})

        self.valid_payload = {
            'name': 'Plano Contabil',
            'description': 'Este é um plano contabil'
        }
        self.invalid_payload = {
            'name': '', # Nome do plano não pode swer vazio
            'description': 'Caso o nome seja invalido'
        }

    def test_create_billing_plan_success(self):
        """
        Caso de aceite 1 : Como usuário do sistema desejo cadastrar um plano contabil
        """

        response = self.client.post(self.list_url, self.valid_payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(BillingPlan.objects.count(), 2)
        self.assertEqual(response.data['name'], 'Plano Contabil')
        print("[TEST_CREATE] Plano contábil criado com sucesso!")
    
    def test_create_billing_plan_invalid_payload(self):
        """
        Caso de aceite 2: Como sistema, ao tentar cadastrar um plano de contas com nome vazio devo recusar
        """

        response = self.client.post(self.list_url, self.invalid_payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(BillingPlan.objects.count(), 1)
        print("[TEST_INVALID_CREATE] Validação de nome vazio funcionando!")
    
    def test_get_billing_plan_detail_success(self):
        """
        Critério: Como usuário, desejo consultar um plano contábil pelo seu UUID.
        Esperado: 200 OK + dados corretos do plano retornados.
        """
        print("[ESCREVER_TEST_3] Escrever teste para GET /billing-plan/<uuid> (esperado 200).")
        pass

    def test_get_billing_plan_detail_not_found(self):
        """
        Critério: Como sistema, devo retornar 404 NOT FOUND para UUID inexistente.
        Esperado: 404 NOT FOUND.
        """
        print("[ESCREVER_TEST_4] Escrever teste para GET com UUID inexistente (esperado 404).")
        pass

    def test_update_billing_plan_success(self):
        """
        Critério: Como usuário, desejo atualizar o nome e a descrição de um plano contábil existente.
        Esperado: 200 OK + valores atualizados persistidos.
        """
        print("[ESCREVER_TEST_5] Escrever teste para PUT /billing-plan/<uuid> (esperado 200).")
        pass

    def test_delete_billing_plan_success(self):
        """
        Critério: Como usuário, desejo deletar um plano contábil sem contas associadas.
        Esperado: 204 NO CONTENT + remoção efetiva do registro.
        Obs: Um plano só pode ser removido se não houver contas vinculadas.
        """
        print("[ESCREVER_TEST_6] Escrever teste para DELETE /billing-plan/<uuid> (esperado 204).")
        pass
