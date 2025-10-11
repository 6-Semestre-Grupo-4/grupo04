from typing import Protocol
from backend.domain.company.company_models import Company

class ICompanyRepository(Protocol):
    """
    Interface de repositório para o agregado Empresa.
    """
    
    def exists_by_cnpj(self, cnpj: str) -> bool: ...
    def save(self, company: Company) -> Company: ...
