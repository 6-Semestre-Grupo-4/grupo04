import re
from dataclasses import dataclass
from django.core.exceptions import ValidationError


@dataclass(frozen=True)
class CPF:
    value: str

    def __post_init__(self):
        if not re.match(r"^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$", self.value):
            raise ValidationError("CPF inválido.")

    def __str__(self):
        return self.value


@dataclass(frozen=True)
class CNPJ:
    value: str

    def __post_init__(self):
        if not re.match(r"^\d{2}\.?\d{3}\.?\d{3}/?\d{4}-?\d{2}$", self.value):
            raise ValidationError("CNPJ inválido.")

    def __str__(self):
        return self.value


@dataclass(frozen=True)
class CRC:
    number: str
    uf: str

    def __post_init__(self):
        if not self.number or not re.match(r"^[A-Z0-9\-]+$", self.number):
            raise ValidationError("Número de CRC inválido.")
        if not self.uf or len(self.uf) != 2:
            raise ValidationError("UF do CRC inválida.")

    def __str__(self):
        return f"{self.number}/{self.uf}"
