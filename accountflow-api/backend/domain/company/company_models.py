from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import EmailValidator
from backend.domain.company.company_value_objects import (
    validate_cnpj, validate_cep, validate_cnae, validate_ie, validate_im, validate_phone
)

class Company(models.Model):
    """
    Entidade de Empresa.
    Cada organização cadastrada no sistema contábil.
    """

    cnpj = models.CharField(_("CNPJ"), max_length=18, unique=True, validators=[validate_cnpj])
    legal_name = models.CharField(_("Razão Social"), max_length=255)
    trade_name = models.CharField(_("Nome Fantasia"), max_length=255, blank=True, null=True)
    opening_date = models.DateField(_("Data de Abertura"), blank=True, null=True)
    logo = models.ImageField(_("Logo da Empresa"), upload_to="companies/logos/", blank=True, null=True)

    state_registration = models.CharField(_("Inscrição Estadual (IE)"), max_length=30, blank=True, null=True, validators=[validate_ie])
    municipal_registration = models.CharField(_("Inscrição Municipal (IM)"), max_length=30, blank=True, null=True, validators=[validate_im])
    cnae_main = models.CharField(_("CNAE Principal"), max_length=10, blank=True, null=True, help_text=_("Formato NNNN-N/NN"), validators=[validate_cnae])

    zip_code = models.CharField(_("CEP"), max_length=9, blank=True, null=True, validators=[validate_cep])
    street = models.CharField(_("Logradouro"), max_length=255, blank=True, null=True)
    number = models.CharField(_("Número"), max_length=30, blank=True, null=True)
    complement = models.CharField(_("Complemento"), max_length=255, blank=True, null=True)
    district = models.CharField(_("Bairro"), max_length=255, blank=True, null=True)
    city = models.CharField(_("Cidade"), max_length=255, blank=True, null=True)

    UF_CHOICES = [
        ("AC","AC"),("AL","AL"),("AP","AP"),("AM","AM"),("BA","BA"),("CE","CE"),("DF","DF"),("ES","ES"),
        ("GO","GO"),("MA","MA"),("MT","MT"),("MS","MS"),("MG","MG"),("PA","PA"),("PB","PB"),("PR","PR"),
        ("PE","PE"),("PI","PI"),("RJ","RJ"),("RN","RN"),("RS","RS"),("RO","RO"),("RR","RR"),("SC","SC"),
        ("SP","SP"),("SE","SE"),("TO","TO"),
    ]
    state = models.CharField(_("Estado (UF)"), max_length=2, choices=UF_CHOICES, blank=True, null=True)

    phone = models.CharField(_("Telefone Fixo"), max_length=20, blank=True, null=True, validators=[validate_phone])
    mobile = models.CharField(_("Telefone Celular"), max_length=20, blank=True, null=True, validators=[validate_phone])
    email = models.EmailField(_("E-mail Principal"), blank=True, null=True, validators=[EmailValidator()])

    TAX_REGIME_CHOICES = [
        ("simples_nacional", _("Simples Nacional")),
        ("lucro_presumido", _("Lucro Presumido")),
        ("lucro_real", _("Lucro Real")),
    ]
    tax_regime = models.CharField(_("Regime Fiscal"), max_length=20, choices=TAX_REGIME_CHOICES)

    created_at = models.DateTimeField(_("Criado em"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Atualizado em"), auto_now=True)

    class Meta:
        verbose_name = _("Empresa")
        verbose_name_plural = _("Empresas")
        ordering = ["legal_name"]
        indexes = [
            models.Index(fields=["cnpj"], name="idx_company_cnpj"),
        ]

    def __str__(self):
        return f"{self.legal_name} ({self.cnpj})"
