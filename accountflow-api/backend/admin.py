from backend.domain.user.user_admin import *
from backend.domain.company.company_admin import *
from backend.domain.user_company.user_company_admin import *
from django.contrib import admin
from django.contrib.admin import ModelAdmin
from backend.models import Person


class PersonAdmin(ModelAdmin):
    list_display = ('name', 'type_of', 'company')
    search_fields = ('name', 'company__legal_name')
    list_filter = ('company',)


admin.site.register(Person, PersonAdmin)