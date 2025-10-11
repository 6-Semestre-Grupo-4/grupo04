from django.contrib import admin
from backend.domain.user_company.user_company_models import UserCompany

@admin.register(UserCompany)
class UserCompanyAdmin(admin.ModelAdmin):
    list_display = ("user", "company", "role", "created_at")
    list_filter = ("role", "company")
    search_fields = ("user__email", "user__full_name", "company__trade_name", "company__legal_name")
    readonly_fields = ("created_at", "updated_at")
    
    fieldsets = (
        ("Informações do Vínculo", {
            "fields": ("user", "company", "role")
        }),
        ("Auditoria", {
            "fields": ("created_at", "updated_at"),
        }),
    )

    ordering = ("company", "user")