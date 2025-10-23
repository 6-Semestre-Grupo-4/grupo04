from backend.domain.user_company.user_company_models import UserCompany


class FakeUserCompanyRepository:
    """
    Repositório fake para simular persistência em memória de vínculos Usuário–Empresa.
    Usado nos testes de domínio.
    """

    def __init__(self):
        self.data = []

    def exists(self, user, company):
        return any(
            uc.user == user and uc.company == company
            for uc in self.data
        )

    def save(self, user_company: UserCompany):
        if self.exists(user_company.user, user_company.company):
            raise ValueError("Vínculo duplicado: este usuário já está associado a esta empresa.")
        self.data.append(user_company)
        return user_company

    def all(self):
        return self.data
