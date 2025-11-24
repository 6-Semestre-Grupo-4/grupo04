from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0009_alter_entry_billing_account'),
    ]

    operations = [
        migrations.AddField(
            model_name='billingplan',
            name='receivable_control_account',
            field=models.ForeignKey(
                to='backend.billingaccount',
                on_delete=django.db.models.deletion.PROTECT,
                related_name='receivable_control_in_plans',
                null=True,
                blank=True,
            ),
        ),
        migrations.AddField(
            model_name='billingplan',
            name='payable_control_account',
            field=models.ForeignKey(
                to='backend.billingaccount',
                on_delete=django.db.models.deletion.PROTECT,
                related_name='payable_control_in_plans',
                null=True,
                blank=True,
            ),
        ),
    ]