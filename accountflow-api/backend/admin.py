from django.contrib import admin
from django.contrib.admin import ModelAdmin
from backend.forms import BillingAccountForm
from backend.models import Address, Company, BillingPlan, BillingAccount, Preset, Title, Entry

class ReadOnly(ModelAdmin):
    def get_readonly_fields(self, request, obj=None):
        return super().get_readonly_fields(request, obj) + ("created_at", "updated_at")


class AddressAdmin(ReadOnly):
    list_display = ('street', 'city', 'state', 'zip_code')
    search_fields = ('street', 'city', 'state')


class CompanyAdmin(ReadOnly):
    list_display = ('fantasy_name', 'social_reason', 'cnpj', 'type_of',)
    search_fields = ('fantasy_name', 'social_reason', 'cnpj', 'type_of',)
    list_filter = ('fantasy_name',)

class BillingPlanAdmin(ReadOnly):
    list_display=('name', 'description')
    search_fields=('name',)
    list_filter=('name',)


class BillingAccountAdmin(ReadOnly):
    list_display=('name', 'billing_plan_id', 'account_type', 'parent', 'is_active')
    search_fields=('name', 'billing_plan_id', 'account_type', 'parent', 'is_active', 'code')
    list_filter=('name', 'account_type')
    readonly_fields=('code','classification')

class PresetAdmin(ReadOnly):
    list_display = ('name', 'description')
    search_fields = ('name',)

class TitleAdmin(ReadOnly):
    list_display = ('description', 'amount', 'active', 'expiration_date')
    search_fields = ('description', 'expiration_date')

class EntryAdmin(ReadOnly):
    list_display = ('description', 'title', 'amount', 'paid_at', 'payment_method', 'billing_account')
    search_fields = ('description', 'title__description')
    list_filter = ('payment_method', 'paid_at', 'title__type_of')
    date_hierarchy = 'paid_at'
    readonly_fields = ('created_at', 'updated_at')

    autocomplete_fields = ['title', 'billing_account']
        
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('title', 'description', 'amount')
        }),
        ('Pagamento', {
            'fields': ('paid_at', 'payment_method')
        }),
        ('Contabilidade', {
            'fields': ('billing_account',)
        }),
        ('Auditoria', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    ordering = ('-paid_at',)

admin.site.register(Address, AddressAdmin)
admin.site.register(Company, CompanyAdmin)
admin.site.register(BillingPlan, BillingPlanAdmin)
admin.site.register(BillingAccount, BillingAccountAdmin)
admin.site.register(Preset, PresetAdmin)
admin.site.register(Title, TitleAdmin)
admin.site.register(Entry, EntryAdmin)