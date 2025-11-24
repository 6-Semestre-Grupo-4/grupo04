# accountflow-api/backend/migrations/0012_remove_legacy_preset_name_fields.py
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0011_add_revenue_expense_accounts_to_preset'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='preset',
            name='payable_name',
        ),
        migrations.RemoveField(
            model_name='preset',
            name='receivable_name',
        ),
    ]