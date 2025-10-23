import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

_CNPJ_RE = re.compile(r"^\d{2}\.?\d{3}\.?\d{3}/?\d{4}-?\d{2}$")

def _only_digits(s: str) -> str:
    return re.sub(r"\D", "", s or "")

def validate_cnpj(value: str):
    if not value:
        raise ValidationError(_("CNPJ é obrigatório."))
    if not _CNPJ_RE.match(value):
        raise ValidationError(_("Formato inválido de CNPJ. Use XX.XXX.XXX/XXXX-XX."))

    digits = _only_digits(value)
    if len(digits) != 14:
        raise ValidationError(_("CNPJ deve conter 14 dígitos."))

    if digits == digits[0] * 14:
        raise ValidationError(_("CNPJ inválido."))

    def dv_calc(nums: str) -> str:
        peso = list(range(len(nums)-6, 1, -1)) + list(range(9, 1, -1))
        soma = sum(int(n)*p for n, p in zip(nums, peso))
        dv = 11 - (soma % 11)
        return "0" if dv >= 10 else str(dv)

    dv1 = dv_calc(digits[:12])
    dv2 = dv_calc(digits[:12] + dv1)
    if digits[-2:] != dv1 + dv2:
        raise ValidationError(_("CNPJ inválido (dígitos verificadores)."))

_CEP_RE = re.compile(r"^\d{5}-?\d{3}$")
def validate_cep(value: str):
    if value and not _CEP_RE.match(value):
        raise ValidationError(_("CEP inválido. Use XXXXX-XXX."))

_CNAE_RE = re.compile(r"^\d{4}-\d/\d{2}$")
def validate_cnae(value: str):
    if value and not _CNAE_RE.match(value):
        raise ValidationError(_("CNAE inválido. Use NNNN-N/NN."))

def validate_ie(value: str):
    if value is not None and not value.strip():
        raise ValidationError(_("Inscrição Estadual inválida."))

def validate_im(value: str):
    if value is not None and not value.strip():
        raise ValidationError(_("Inscrição Municipal inválida."))

_PHONE_RE = re.compile(r"^\+?\d{8,15}$")
def validate_phone(value: str):
    if value and not _PHONE_RE.match(value):
        raise ValidationError(_("Telefone inválido. Use apenas dígitos."))
