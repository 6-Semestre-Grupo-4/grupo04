from django.core.exceptions import ValidationError
from accountflow.domain.models import User


class UserDomainService:

    @staticmethod
    def can_create_user(email: str, cpf_cnpj: str) -> bool:
        """Impede duplicidade de e-mail ou CPF/CNPJ no domínio."""
        if User.objects.filter(email=email).exists():
            raise ValidationError("E-mail já cadastrado.")
        if User.objects.filter(cpf_cnpj=cpf_cnpj).exists():
            raise ValidationError("CPF/CNPJ já cadastrado.")
        return True

    @staticmethod
    def assign_role(user: User, new_role: str):
        if new_role == "accountant" and not user.crc_number:
            raise ValidationError("Contadores devem possuir CRC.")
        user.role = new_role
        user.save()
        return user
