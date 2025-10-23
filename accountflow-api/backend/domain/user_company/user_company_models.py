from django.db import models
from django.utils.translation import gettext_lazy as _
from backend.domain.user.user_models import User
from backend.domain.company.company_models import Company


class UserCompany(models.Model):
    """
    Agregado que representa o vínculo entre Usuário e Empresa.
    É parte do domínio de acesso e gestão multiempresa.
    """

    class Role(models.TextChoices) :
        MASTER = "master", _("Master")  # Dono da empresa
        ADMIN = "admin", _("Administrador") # Pode gerenciar usuários e dados
        USER = "user", _("Usuário") # Acesso operacional

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="company_links",
        verbose_name=_("Usuário"),
    )
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="user_links",
        verbose_name=_("Empresa"),
    )
    role = models.CharField(
        _("Papel na empresa"),
        max_length=20,
        choices=Role.choices,
        default=Role.USER,
    )

    created_at = models.DateTimeField(_("Criado em"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Atualizado em"), auto_now=True)

    class Meta:
        verbose_name = _("Vínculo Usuário-Empresa")
        verbose_name_plural = _("Vínculos Usuário-Empresa")
        unique_together = ("user", "company")
        ordering = ["user", "company"]

    def __str__(self):
        return f"{self.user.full_name} — {self.company.trade_name} ({self.get_role_display()})"
    
    def is_master(self) -> bool:
        return self.role == self.Role.MASTER

    def can_manage_users(self) -> bool:
        """Admin ou Master podem gerenciar outros vínculos."""
        return self.role in [self.Role.MASTER, self.Role.ADMIN]
