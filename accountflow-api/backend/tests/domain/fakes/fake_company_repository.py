from backend.domain.company.company_models import Company

class FakeCompanyRepository:
    def __init__(self):
        self._by_cnpj = {}
    
    def exists_by_cnpj(self, cnpj: str) -> bool:
        return cnpj in self._by_cnpj

    def save(self, company: Company) -> Company:
        self._by_cnpj[company.cnpj] = company
        return company