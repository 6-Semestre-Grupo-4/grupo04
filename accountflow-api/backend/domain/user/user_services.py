from django.core.exceptions import ValidationError
from backend.domain.user.user_models import User

class UserDomainService:
    """
    Serviço de domínio que usa um repositório injetado.
    """

    def __init__(self, repository):
        self.repository = repository

    def criar_usuario(self, email, password, full_name, cpf_cnpj):
        if self.repository.exists_by_email(email):
            raise ValidationError("E-mail já cadastrado")

        user = User(email=email, full_name=full_name, cpf_cnpj=cpf_cnpj)
        user.set_password(password)

        return self.repository.save(user)
