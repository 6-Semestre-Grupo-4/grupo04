# Generated manually to fix billing_account field

from django.db import migrations, models
import django.db.models.deletion


def ensure_no_null_billing_accounts(apps, schema_editor):
    """
    Garante que não há registros Entry com billing_account=None
    antes de tornar o campo obrigatório.
    """
    Entry = apps.get_model('backend', 'Entry')
    BillingAccount = apps.get_model('backend', 'BillingAccount')
    
    # Verifica se há entries sem billing_account
    entries_without_account = Entry.objects.filter(billing_account__isnull=True)
    if entries_without_account.exists():
        # Se houver, tenta obter uma conta padrão ou levanta erro
        default_account = BillingAccount.objects.filter(
            account_type='analytic'
        ).first()
        
        if not default_account:
            raise ValueError(
                "Não é possível tornar billing_account obrigatório: "
                "existem registros Entry sem billing_account e não há "
                "conta analítica padrão disponível."
            )
        
        # Atualiza os registros sem billing_account
        entries_without_account.update(billing_account=default_account)


def reverse_ensure_no_null_billing_accounts(apps, schema_editor):
    """
    Função reversa - não precisa fazer nada
    """
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0008_remove_billingaccount_classification_and_more'),
    ]

    operations = [
        migrations.RunPython(
            ensure_no_null_billing_accounts,
            reverse_ensure_no_null_billing_accounts
        ),
        migrations.AlterField(
            model_name='entry',
            name='billing_account',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.PROTECT,
                related_name='entries',
                to='backend.billingaccount',
                blank=False,
                null=False
            ),
        ),
    ]

