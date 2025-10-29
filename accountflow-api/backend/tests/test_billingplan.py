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
        print("[TEST_CREATE] Teste realizado com sucesso!")
    
    def test_create_billing_plan_invalid_payload(self):
        """
        Caso de aceite 2: Como sistema, ao tentar cadastrar um plano de contas com nome vazio devo recusar
        """

        response = self.client.post(self.list_url, self.invalid_payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(BillingPlan.objects.count(), 1)
        print("[TEST_INVALID_CREATE] Teste realizado com sucesso!")
    
    def test_get_billing_plan_Detail_success(self):
        """
        Critério de aceite 3: Como usuário gostaria de buscar um plano pelo id
        """
        print('Escrever Teste 3')
        pass

    def test_get_billing_plant_Detail_not_found(self):
        """
        Critério de aceite 4: Como sistema devo retornar 404 NOT FOUND para UUID invalido
        """
        print('Escrever Teste 4')
        pass

    def test_update_billing_plan_success(self):
        """
        Critério de aceite 5: Como usuário gostaria de atualizar o nome do plano contabil
        """
        print('Escrever Teste 5')
        pass
    
    def test_delete_billing_plan_success(self):
        """
        Critério de aceite 5: Como usuário gostaria de deletar um plano contabil
        Obs: Um plano de contas só pode ser deletado se não tiver nenhuma conta contabil associada
        """
        print('Escrever Teste 6')
        pass
    
