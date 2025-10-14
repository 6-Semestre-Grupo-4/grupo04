import pytest
from django.core.exceptions import ValidationError
from backend.domain.user.user_services import UserDomainService
from backend.tests.domain.fakes.fake_user_repository import FakeUserRepository


class TestUserDomainService:
    def setup_method(self):
        self.repo = FakeUserRepository()
        self.service = UserDomainService(self.repo)

    def test_criar_usuario_valido(self):
        """
        Dado que informo um e-mail e senha válidos,
        Quando crio o usuário,
        Então ele deve ser salvo.
        """
        user = self.service.criar_usuario(
            email="user@accountflow.com.br",
            password="senhaSegura123",
            full_name="Usuário Contábil",
            cpf_cnpj="12345678900",
        )

        assert user.email == "user@accountflow.com.br"
        assert len(self.repo._users) == 1

    def test_nao_deve_permitir_email_duplicado(self):
        """
        Dado que já existe um usuário com o mesmo e-mail,
        Quando tento criar outro igual,
        Então o sistema deve lançar erro de domínio.
        """
        self.service.criar_usuario(
            email="duplicado@accountflow.com.br",
            password="senhaSegura123",
            full_name="Usuário 1",
            cpf_cnpj="00011122233",
        )

        with pytest.raises(ValidationError, match="E-mail já cadastrado"):
            self.service.criar_usuario(
                email="duplicado@accountflow.com.br",
                password="senhaSegura123",
                full_name="Usuário 2",
                cpf_cnpj="99988877766",
            )
