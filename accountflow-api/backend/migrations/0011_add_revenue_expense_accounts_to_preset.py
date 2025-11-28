from django.db import migrations, models
import django.db.models.deletion


def backfill_preset_account_names(apps, schema_editor):
    Preset = apps.get_model('backend', 'Preset')
    for p in Preset.objects.all():
        # Copia nomes das contas, se existirem
        payable_name = p.payable_account.name if getattr(p, 'payable_account_id', None) else ''
        receivable_name = p.receivable_account.name if getattr(p, 'receivable_account_id', None) else ''
        revenue_name = p.revenue_account.name if getattr(p, 'revenue_account_id', None) else ''
        expense_name = p.expense_account.name if getattr(p, 'expense_account_id', None) else ''
        updates = {}
        if hasattr(p, 'payable_account_name'):
            updates['payable_account_name'] = payable_name or ''
        if hasattr(p, 'receivable_account_name'):
            updates['receivable_account_name'] = receivable_name or ''
        if hasattr(p, 'revenue_account_name'):
            updates['revenue_account_name'] = revenue_name or ''
        if hasattr(p, 'expense_account_name'):
            updates['expense_account_name'] = expense_name or ''
        if updates:
            for k, v in updates.items():
                setattr(p, k, v)
            p.save(update_fields=list(updates.keys()))


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0010_add_control_accounts_to_billingplan'),
    ]

    operations = [
        # FKs novas (opcionais)
        migrations.AddField(
            model_name='preset',
            name='revenue_account',
            field=models.ForeignKey(
                to='backend.billingaccount',
                on_delete=django.db.models.deletion.PROTECT,
                related_name='revenue_presets',
                null=True,
                blank=True,
            ),
        ),
        migrations.AddField(
            model_name='preset',
            name='expense_account',
            field=models.ForeignKey(
                to='backend.billingaccount',
                on_delete=django.db.models.deletion.PROTECT,
                related_name='expense_presets',
                null=True,
                blank=True,
            ),
        ),

        # Campos de nome (strings) usados pelos serializers
        migrations.AddField(
            model_name='preset',
            name='payable_account_name',
            field=models.CharField(max_length=255, blank=True, default=''),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='preset',
            name='receivable_account_name',
            field=models.CharField(max_length=255, blank=True, default=''),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='preset',
            name='revenue_account_name',
            field=models.CharField(max_length=255, blank=True, default=''),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='preset',
            name='expense_account_name',
            field=models.CharField(max_length=255, blank=True, default=''),
            preserve_default=False,
        ),

        migrations.RunPython(backfill_preset_account_names, migrations.RunPython.noop),
    ]