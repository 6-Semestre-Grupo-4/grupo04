import pytest
from django.core.exceptions import ValidationError
from backend.domain.company.company_services import CompanyDomainService
from backend.tests.domain.fakes.fake_company_repository import FakeCompanyRepository

class TestCompanyDomainService:
    def setup_method(self):
        self.repo = FakeCompanyRepository()
        self.service = CompanyDomainService(self.repo)

    def test_criar_empresa_valida(self):
        """
        Dado que informo dados validos,
        Quando salvo a empresa,
        Então ela deve ser salva.
        """
        c = self.service.create_company(
            cnpj="12.345.678/0001-95",
            legal_name="ContaFácil LTDA",
            trade_name="ContaFácil",
            tax_regime="simples_nacional",
        )
        assert c.legal_name == "ContaFácil LTDA"
        assert c.cnpj == "12.345.678/0001-95"

    def test_bloquear_cnpj_duplicado(self):
        """
        Dado que já existe uma empresa com o CNPJ X,
        Quando tento cadastrar novamente,
        Então o sistema deve lançar erro de domínio.
        """
        self.service.create_company(
            cnpj="12.345.678/0001-95",
            legal_name="Primeira LTDA",
            tax_regime="simples_nacional",
        )
        with pytest.raises(ValidationError, match="Já existe uma empresa com este CNPJ."):
            self.service.create_company(
                cnpj="12.345.678/0001-95",
                legal_name="Segunda LTDA",
                tax_regime="lucro_presumido",
            )