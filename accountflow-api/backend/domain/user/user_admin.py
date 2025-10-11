from django.contrib import admin
from django import forms
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from backend.domain.user.user_models import User

# ========================
# FORMULÁRIOS PERSONALIZADOS
# ========================

class UserCreationForm(forms.ModelForm):
    """
    Formulário de criação de usuário.
    """
    password1 = forms.CharField(label=_("Senha"), widget=forms.PasswordInput)
    password2 = forms.CharField(label=_("Confirmação de senha"), widget=forms.PasswordInput)

    class Meta:
        model = User
        fields = ("email", "full_name", "cpf_cnpj", "phone", "role")

    def clean_password2(self):
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError(_("As senhas não coincidem."))
        return password2

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        if commit:
            user.save()
        return user


class UserChangeForm(forms.ModelForm):
    """Formulário de edição de usuário"""
    class Meta:
        model = User
        fields = "__all__"

# ========================
# ADMIN CUSTOMIZADO
# ========================

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    add_form = UserCreationForm
    form = UserChangeForm
    model = User

    list_display = ("email", "full_name", "role", "is_active", "is_staff")
    list_filter = ("role", "is_active", "is_staff", "is_superuser")

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (_("Informações pessoais"), {"fields": ("full_name", "cpf_cnpj", "phone", "role")}),
        (_("Permissões"), {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        (_("Datas importantes"), {"fields": ("last_login", "date_joined")}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": (
                "email",
                "full_name",
                "cpf_cnpj",
                "phone",
                "role",
                "password1",
                "password2",
            ),
        }),
    )

    search_fields = ("email", "full_name", "cpf_cnpj")
    ordering = ("email",)
    filter_horizontal = ("groups", "user_permissions")

