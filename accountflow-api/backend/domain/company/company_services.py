from django.core.exceptions import ValidationError
from backend.domain.company.company_models import Company
from backend.domain.company.company_repository import ICompanyRepository

class CompanyDomainService:
    """
    Serviço de domínio que usa um repositório injetado.
    """
    def __init__(self, repository: ICompanyRepository):
        self.repository = repository

    def create_company(self, *, cnpj: str, legal_name: str, trade_name: str | None = None,
                       opening_date=None, **extra) -> Company:
        if self.repository.exists_by_cnpj(cnpj):
            raise ValidationError("Já existe uma empresa com este CNPJ.")
        company = Company(cnpj=cnpj, legal_name=legal_name, trade_name=trade_name, opening_date=opening_date, **extra)
        return self.repository.save(company)
