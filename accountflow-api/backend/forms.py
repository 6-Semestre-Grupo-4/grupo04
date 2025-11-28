from django import forms
from backend.models import BillingAccount

class BillingAccountForm(forms.ModelForm):
    class Meta:
        model = BillingAccount
        fields = ['name', 'billing_plan', 'parent', 'account_type', 'is_active']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        billing_plan = getattr(self.instance, "billing_plan", None)

        if billing_plan:
            # Se já há um billing_plan, filtra normalmente
            self.fields['parent'].queryset = BillingAccount.objects.filter(
                is_active=True,
                billing_plan=billing_plan
            )
        else:
            # Caso contrário, define queryset vazio e placeholder
            self.fields['parent'].queryset = BillingAccount.objects.none()
            self.fields['parent'].empty_label = "Selecione um plano primeiro"
