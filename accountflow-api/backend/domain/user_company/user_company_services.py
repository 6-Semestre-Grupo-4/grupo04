from django.core.exceptions import ValidationError
from backend.domain.user_company.user_company_models import UserCompany


class UserCompanyDomainService:
    """
    Serviço de domínio para regras de vínculo entre Usuário e Empresa.
    """

    def __init__(self, repository):
        self.repository = repository

    def link_user_to_company(self, user, company, role="user"):
        if self.repository.exists(user, company):
            raise ValidationError("O vínculo entre este usuário e empresa já existe.")
        return self.repository.save(UserCompany(user=user, company=company, role=role))