from django.contrib import admin
from django.contrib.admin import ModelAdmin
from backend.models import Address, Company


class AddressAdmin(ModelAdmin):
    list_display = ('street', 'city', 'state', 'zip_code')
    search_fields = ('street', 'city', 'state')


class CompanyAdmin(ModelAdmin):
    list_display = ('fantasy_name', 'social_reason', 'cnpj', 'type_of',)
    search_fields = ('fantasy_name', 'social_reason', 'cnpj', 'type_of',)
    list_filter = ('fantasy_name',)


admin.site.register(Address, AddressAdmin)
admin.site.register(Company, CompanyAdmin)