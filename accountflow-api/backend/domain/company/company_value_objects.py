import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

def _only_digits(s: str) -> str:

    return re.sub(r"\D", "", s or "")


def validate_cnpj(value: str):
    if not value:
        raise ValidationError(_("CNPJ é obrigatório."))

    digits = _only_digits(value)
    if len(digits) != 14:
        raise ValidationError(_("CNPJ deve conter 14 dígitos."))

    if digits == digits[0] * 14:
        raise ValidationError(_("CNPJ inválido (dígitos repetidos)."))

    weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    soma1 = sum(int(n) * p for n, p in zip(digits[:12], weights1))
    dv1 = 11 - (soma1 % 11)
    dv1_calc = "0" if dv1 >= 10 else str(dv1)

    weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    soma2 = sum(int(n) * p for n, p in zip(digits[:12] + dv1_calc, weights2))
    dv2 = 11 - (soma2 % 11)
    dv2_calc = "0" if dv2 >= 10 else str(dv2)

    if digits[-2:] != dv1_calc + dv2_calc:
        raise ValidationError(_("CNPJ inválido (dígitos verificadores)."))


def validate_cep(value: str):
    if not value:
        return  
    
    digits = _only_digits(value)
    if len(digits) != 8:
        raise ValidationError(_("CEP inválido. Deve conter 8 dígitos."))

def validate_cnae(value: str):
    if not value:
        return 
    
    digits = _only_digits(value)
    if len(digits) != 7:
        raise ValidationError(_("CNAE inválido. Deve conter 7 dígitos."))

def validate_ie(value: str):
    if value is not None and not value.strip():
         raise ValidationError(_("Inscrição Estadual não pode ser apenas espaços."))


def validate_im(value: str):
    """Valida se a IM, se preenchida, não está em branco."""
    if value is not None and not value.strip():
         raise ValidationError(_("Inscrição Municipal não pode ser apenas espaços."))

def validate_phone(value: str):
    if not value:
        return 
    
    digits = _only_digits(value)
    if len(digits) < 8 or len(digits) > 15:
        raise ValidationError(_("Telefone inválido. Deve conter de 8 a 15 dígitos."))