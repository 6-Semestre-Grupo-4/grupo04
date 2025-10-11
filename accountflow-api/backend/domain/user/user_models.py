from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import RegexValidator
from backend.domain.user.user_manager import UserManager

class User(AbstractUser):
    """
    Entidade de Usuário Contábil.
    Representa um indivíduo ou empresa com acesso ao sistema.
    """
    app_label = "backend"
    username = None
    email = models.EmailField(_("E-mail"), unique=True)
    full_name = models.CharField(_("Nome completo / Razão social"), max_length=255)

    cpf_cnpj = models.CharField(
        _("CPF / CNPJ"),
        max_length=18,
        unique=True,
        validators=[
            RegexValidator(
                regex=r"^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$|^\d{2}\.?\d{3}\.?\d{3}/?\d{4}-?\d{2}$",
                message=_("Formato inválido de CPF ou CNPJ."),
            )
        ],
    )

    phone = models.CharField(_("Telefone"), max_length=20, blank=True, null=True)

    ROLE_CHOICES = [
        ("accountant", "Contador"),
        ("manager", "Gestor"),
        ("staff", "Colaborador"),
    ]
    role = models.CharField(_("Papel no sistema"), max_length=20, choices=ROLE_CHOICES, default="client")

    created_at = models.DateTimeField(_("Criado em"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Atualizado em"), auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name", "cpf_cnpj"]

    objects = UserManager()

    companies = models.ManyToManyField(
        "backend.company",
        through="backend.UserCompany",
        related_name="users",
        verbose_name=_("Empresas")
    )

    class Meta:
        verbose_name = _("Usuário")
        verbose_name_plural = _("Usuários")
        ordering = ["email"]

    def __str__(self):
        return f"{self.full_name} ({self.email})"


