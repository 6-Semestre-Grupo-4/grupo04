from django.contrib import admin
from backend.domain.company.company_models import Company
from backend.domain.user_company.user_company_models import UserCompany

class UserCompanyInline(admin.TabularInline):
    model = UserCompany
    extra = 1
    autocomplete_fields = ("user",)
    readonly_fields = ("created_at", "updated_at")

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ("legal_name", "cnpj", "tax_regime", "opening_date", "created_at")
    search_fields = ("legal_name", "trade_name", "cnpj", "email")
    list_filter = ("tax_regime", "state", "created_at")
    fieldsets = (
        ("Dados Principais", {"fields": ("cnpj", "legal_name", "trade_name", "opening_date", "logo")}),
        ("Inscrições e Registros", {"fields": ("state_registration", "municipal_registration", "cnae_main")}),
        ("Endereço", {"fields": ("zip_code", "street", "number", "complement", "district", "city", "state")}),
        ("Contato", {"fields": ("phone", "mobile", "email")}),
        ("Configuração Contábil", {"fields": ("tax_regime",)}),
    )
    inlines = [UserCompanyInline]
    ordering = ("legal_name",)
