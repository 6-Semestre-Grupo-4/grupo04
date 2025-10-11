from typing import Protocol, List, Optional
from backend.domain.user_company.user_company_models import UserCompany


class IUserCompanyRepository(Protocol):
    """
    Interface de repositório para o agregado UserCompany.
    """
    def exists(self, user, company):
        return UserCompany.objects.filter(user=user, company=company).exists()

    def save(self, user_company: UserCompany):
        user_company.save()
        return user_company
    
