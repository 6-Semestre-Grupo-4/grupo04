import pytest
from backend.domain.user.user_models import User 
from backend.domain.company.company_models import Company 
from backend.domain.user_company.user_company_services import UserCompanyDomainService
from backend.tests.domain.fakes.fake_user_company_fake_respository import FakeUserCompanyRepository
from django.core.exceptions import ValidationError

class TestUserCompanyDomainService:
    def setup_method(self):
        self.repo = FakeUserCompanyRepository()
        self.service = UserCompanyDomainService(self.repo)

    def test_criar_vinculo_valido(self):
        user = User(
            id=1, 
            email="user@test.com",
            full_name="Usuário Teste",
            cpf_cnpj="123.456.789-10",
        )
        company = Company(
            id=1,
            cnpj="12.345.678/0001-95",
            legal_name="Empresa Teste LTDA",
        )
        
        vinculo = self.service.link_user_to_company(user, company, role="admin")

        assert vinculo is not None
        assert vinculo.user.id == user.id
        assert vinculo.company.id == company.id
        assert vinculo.role == "admin"

    def test_nao_permitir_vinculo_duplicado(self):
        user = User(id=2, email="user2@test.com")
        company = Company(id=2, cnpj="98.765.432/0001-10")
        
        self.service.link_user_to_company(user, company, role="master")
        
        with pytest.raises(ValidationError, match="O vínculo entre este usuário e empresa já existe."):
            self.service.link_user_to_company(user, company, role="admin")