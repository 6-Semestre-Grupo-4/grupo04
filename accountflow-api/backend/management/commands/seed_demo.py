from django.core.management.base import BaseCommand
from django.utils import timezone

from backend.models import Address, Company, BillingPlan, BillingAccount, Preset, Title, Entry


class Command(BaseCommand):
    help = "Seed demo data: company, accounts, titles, entries"

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding demo data..."))

        # Address
        addr, _ = Address.objects.get_or_create(
            zip_code="85883-000",
            defaults={
                "street": "Av. Brasil",
                "number": "100",
                "complement": "Sala 1",
                "neighborhood": "Centro",
                "city": "Cascavel",
                "state": "PR",
            },
        )

        # Company
        company, _ = Company.objects.get_or_create(
            cnpj="12.345.678/0001-90",
            defaults={
                "fantasy_name": "Demo LTDA",
                "social_reason": "Demo LTDA",
                "opening_date": timezone.now().date(),
                "cnae": "6201-5/01",
                "email": "demo@example.com",
                "phone": "(45) 99999-9999",
                "tax_regime": "simples_nacional",
                "type_of": "Client",
                "address": addr,
            },
        )

        # Billing plan and accounts (basic revenue/expense structure)
        plan = BillingPlan.objects.filter(name="Plano Demo").first()
        if not plan:
            # Create plan via bulk_create to bypass full_clean on save
            BillingPlan.objects.bulk_create([
                BillingPlan(name="Plano Demo", description="Plano gerado pelo seed")
            ])
            plan = BillingPlan.objects.get(name="Plano Demo")

            # Create root synthetic accounts
            income_root = BillingAccount.objects.create(
                name="Receitas",
                billing_plan=plan,
                parent=None,
                account_type=BillingAccount.AccountType.SYNTHETIC,
                is_active=True,
            )
            expense_root = BillingAccount.objects.create(
                name="Despesas",
                billing_plan=plan,
                parent=None,
                account_type=BillingAccount.AccountType.SYNTHETIC,
                is_active=True,
            )

            # Create multiple level-1 synthetic accounts under roots
            income_lvl1_ops = BillingAccount.objects.create(
                name="Receitas Operacionais",
                billing_plan=plan,
                parent=income_root,
                account_type=BillingAccount.AccountType.SYNTHETIC,
                is_active=True,
            )
            income_lvl1_fin = BillingAccount.objects.create(
                name="Receitas Financeiras",
                billing_plan=plan,
                parent=income_root,
                account_type=BillingAccount.AccountType.SYNTHETIC,
                is_active=True,
            )

            expense_lvl1_ops = BillingAccount.objects.create(
                name="Despesas Operacionais",
                billing_plan=plan,
                parent=expense_root,
                account_type=BillingAccount.AccountType.SYNTHETIC,
                is_active=True,
            )
            expense_lvl1_admin = BillingAccount.objects.create(
                name="Despesas Administrativas",
                billing_plan=plan,
                parent=expense_root,
                account_type=BillingAccount.AccountType.SYNTHETIC,
                is_active=True,
            )

            # Create analytic control accounts under level-1 for plan controls
            receivable_ctrl = BillingAccount.objects.create(
                name="Recebimentos",
                billing_plan=plan,
                parent=income_lvl1_ops,
                account_type=BillingAccount.AccountType.ANALYTIC,
                is_active=True,
            )
            payable_ctrl = BillingAccount.objects.create(
                name="Pagamentos",
                billing_plan=plan,
                parent=expense_lvl1_ops,
                account_type=BillingAccount.AccountType.ANALYTIC,
                is_active=True,
            )

            # Now update plan with control accounts (will pass clean validations)
            plan.receivable_control_account = receivable_ctrl
            plan.payable_control_account = payable_ctrl
            plan.save()
        else:
            # Fetch existing roots and controls or create if missing
            income_root = BillingAccount.objects.filter(billing_plan=plan, parent__isnull=True, account_type=BillingAccount.AccountType.SYNTHETIC, name="Receitas").first()
            if not income_root:
                income_root = BillingAccount.objects.create(
                    name="Receitas",
                    billing_plan=plan,
                    parent=None,
                    account_type=BillingAccount.AccountType.SYNTHETIC,
                    is_active=True,
                )
            expense_root = BillingAccount.objects.filter(billing_plan=plan, parent__isnull=True, account_type=BillingAccount.AccountType.SYNTHETIC, name="Despesas").first()
            if not expense_root:
                expense_root = BillingAccount.objects.create(
                    name="Despesas",
                    billing_plan=plan,
                    parent=None,
                    account_type=BillingAccount.AccountType.SYNTHETIC,
                    is_active=True,
                )
            # Ensure multiple level-1 synthetic accounts exist
            income_lvl1_ops = BillingAccount.objects.filter(billing_plan=plan, parent=income_root, name="Receitas Operacionais").first()
            if not income_lvl1_ops:
                income_lvl1_ops = BillingAccount.objects.create(
                    name="Receitas Operacionais",
                    billing_plan=plan,
                    parent=income_root,
                    account_type=BillingAccount.AccountType.SYNTHETIC,
                    is_active=True,
                )
            income_lvl1_fin = BillingAccount.objects.filter(billing_plan=plan, parent=income_root, name="Receitas Financeiras").first()
            if not income_lvl1_fin:
                income_lvl1_fin = BillingAccount.objects.create(
                    name="Receitas Financeiras",
                    billing_plan=plan,
                    parent=income_root,
                    account_type=BillingAccount.AccountType.SYNTHETIC,
                    is_active=True,
                )
            expense_lvl1_ops = BillingAccount.objects.filter(billing_plan=plan, parent=expense_root, name="Despesas Operacionais").first()
            if not expense_lvl1_ops:
                expense_lvl1_ops = BillingAccount.objects.create(
                    name="Despesas Operacionais",
                    billing_plan=plan,
                    parent=expense_root,
                    account_type=BillingAccount.AccountType.SYNTHETIC,
                    is_active=True,
                )
            expense_lvl1_admin = BillingAccount.objects.filter(billing_plan=plan, parent=expense_root, name="Despesas Administrativas").first()
            if not expense_lvl1_admin:
                expense_lvl1_admin = BillingAccount.objects.create(
                    name="Despesas Administrativas",
                    billing_plan=plan,
                    parent=expense_root,
                    account_type=BillingAccount.AccountType.SYNTHETIC,
                    is_active=True,
                )

            if not plan.receivable_control_account:
                plan.receivable_control_account = BillingAccount.objects.create(
                    name="Recebimentos",
                    billing_plan=plan,
                    parent=income_lvl1_ops,
                    account_type=BillingAccount.AccountType.ANALYTIC,
                    is_active=True,
                )
                plan.save()
            if not plan.payable_control_account:
                plan.payable_control_account = BillingAccount.objects.create(
                    name="Pagamentos",
                    billing_plan=plan,
                    parent=expense_lvl1_ops,
                    account_type=BillingAccount.AccountType.ANALYTIC,
                    is_active=True,
                )
                plan.save()

        # Preset just to align with existing schema
        preset, _ = Preset.objects.get_or_create(
            name="Padrão",
            description="Preset padrão do seed",
            receivable_account=plan.receivable_control_account,
            payable_account=plan.payable_control_account,
            defaults={
                "revenue_account": plan.receivable_control_account,
                "expense_account": plan.payable_control_account,
                "active": True,
            },
        )

        # Bulk generate many titles and entries (100-150) across recent months
        from decimal import Decimal
        from datetime import date, timedelta
        import random

        # Ensure some child analytic accounts under roots for variation
        # Create analytic categories under multiple level-1 parents
        income_categories = [
            BillingAccount.objects.get_or_create(
                name="Serviços",
                billing_plan=plan,
                parent=income_lvl1_ops,
                account_type=BillingAccount.AccountType.ANALYTIC,
                is_active=True,
            )[0],
            BillingAccount.objects.get_or_create(
                name="Produtos",
                billing_plan=plan,
                parent=income_lvl1_ops,
                account_type=BillingAccount.AccountType.ANALYTIC,
                is_active=True,
            )[0],
            BillingAccount.objects.get_or_create(
                name="Juros",
                billing_plan=plan,
                parent=income_lvl1_fin,
                account_type=BillingAccount.AccountType.ANALYTIC,
                is_active=True,
            )[0],
        ]
        expense_categories = [
            BillingAccount.objects.get_or_create(
                name="Custos",
                billing_plan=plan,
                parent=expense_lvl1_ops,
                account_type=BillingAccount.AccountType.ANALYTIC,
                is_active=True,
            )[0],
            BillingAccount.objects.get_or_create(
                name="Operacionais",
                billing_plan=plan,
                parent=expense_lvl1_ops,
                account_type=BillingAccount.AccountType.ANALYTIC,
                is_active=True,
            )[0],
            BillingAccount.objects.get_or_create(
                name="Administrativos",
                billing_plan=plan,
                parent=expense_lvl1_admin,
                account_type=BillingAccount.AccountType.ANALYTIC,
                is_active=True,
            )[0],
        ]

        base_today = timezone.now().date()
        total_records = random.randint(100, 150)

        created_entries = 0
        for i in range(total_records):
            is_income = i % 2 == 0
            # Spread dates over last 6 months
            days_back = random.randint(0, 180)
            due_date = base_today - timedelta(days=days_back)
            amount_val = round(random.uniform(80.0, 2500.0), 2) if is_income else round(random.uniform(40.0, 1800.0), 2)
            amount = Decimal(str(amount_val))
            desc = ("Venda de serviço" if is_income else "Compra de insumos") + f" #{i+1}"

            title = Title.objects.create(
                company=company,
                description=desc,
                type_of='income' if is_income else 'expense',
                amount=amount,
                expiration_date=due_date,
                preset=preset,
            )

            # Paid date within +/- 5 days from due_date
            paid_date = due_date + timedelta(days=random.randint(-2, 5))
            if is_income:
                acc = random.choice([plan.receivable_control_account] + income_categories)
            else:
                acc = random.choice([plan.payable_control_account] + expense_categories)

            Entry.objects.create(
                title=title,
                description="Recebimento" if is_income else "Pagamento",
                amount=amount,
                billing_account=acc,
                paid_at=paid_date,
                payment_method=random.choice(['pix', 'cash', 'debit', 'credit']),
            )
            created_entries += 1

        self.stdout.write(self.style.SUCCESS(f"Demo data seeded successfully. Titles/entries created: {created_entries}"))