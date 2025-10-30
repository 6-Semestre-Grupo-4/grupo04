from django.contrib import admin
from django.contrib.admin import ModelAdmin
from backend.models import Address, Company, BillingPlan, BillingAccount


class AddressAdmin(ModelAdmin):
    list_display = ('street', 'city', 'state', 'zip_code')
    search_fields = ('street', 'city', 'state')


class CompanyAdmin(ModelAdmin):
    list_display = ('fantasy_name', 'social_reason', 'cnpj', 'type_of',)
    search_fields = ('fantasy_name', 'social_reason', 'cnpj', 'type_of',)
    list_filter = ('fantasy_name',)

class BillingPlanAdmin(ModelAdmin):
    list_display=('name', 'description')
    search_fields=('name',)
    list_filter=('name',)

class BillingAccountAdmin(ModelAdmin):
    list_display=('name', 'billing_plan_id', 'company_id', 'account_type', 'parent', 'is_active')
    search_fields=('name', 'billing_plan_id', 'company_id', 'account_type', 'parent', 'is_active')
    list_filter=('name', 'account_type')
    readonly_fields=('code','classification')

admin.site.register(Address, AddressAdmin)
admin.site.register(Company, CompanyAdmin)
admin.site.register(BillingPlan, BillingPlanAdmin)
admin.site.register(BillingAccount, BillingAccountAdmin)
