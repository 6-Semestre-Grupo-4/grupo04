from django.core.management.base import BaseCommand
from django.utils import timezone

from backend.models import Address, Company, BillingPlan, BillingAccount, Preset, Title, Entry


class Command(BaseCommand):
    help = "Seed demo data: company, accounts, titles, entries"

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Remove existing demo Titles/Entries for the demo company before seeding',
        )
        parser.add_argument(
            '--append',
            action='store_true',
            help='Always append new Titles/Entries (do not skip existing descriptions)',
        )

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

            # Keep local references to control accounts (do not depend on model fields)
            receivable_control = receivable_ctrl
            payable_control = payable_ctrl
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

            # Use local control account variables; if model lacks fields, fallback to creating analytic accounts
        # Preset just to align with existing schema
        # Create or get a preset using name as lookup to keep idempotent
        # Use the local control account variables (fall back safely if plan model doesn't expose fields)
        preset, created_preset = Preset.objects.get_or_create(
            name="Padrão",
            defaults={
                "description": "Preset padrão do seed",
                "receivable_account": receivable_control if 'receivable_control' in locals() else None,
                "payable_account": payable_control if 'payable_control' in locals() else None,
                "revenue_account": receivable_control if 'receivable_control' in locals() else None,
                "expense_account": payable_control if 'payable_control' in locals() else None,
                "active": True,
            },
        )
        # If preset existed but accounts are not set, update them
        if not created_preset:
            changed = False
            # Update missing preset accounts using local control account references
            if not preset.receivable_account and 'receivable_control' in locals() and receivable_control:
                preset.receivable_account = receivable_control
                changed = True
            if not preset.payable_account and 'payable_control' in locals() and payable_control:
                preset.payable_account = payable_control
                changed = True
            if not preset.revenue_account and 'receivable_control' in locals() and receivable_control:
                preset.revenue_account = receivable_control
                changed = True
            if not preset.expense_account and 'payable_control' in locals() and payable_control:
                preset.expense_account = payable_control
                changed = True
            if changed:
                preset.save()

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

        # Handle CLI options: --force removes existing Titles/Entries for the demo company
        # --append will always add new Titles/Entries (skip existence check)
        force = options.get('force')
        append = options.get('append')

        if force:
            # Delete entries then titles to avoid PROTECT constraints
            Entry.objects.filter(title__company=company).delete()
            Title.objects.filter(company=company).delete()
            existing_titles = set()
        else:
            if append:
                existing_titles = set()
            else:
                # Make seeding of titles/entries idempotent: only create titles that don't already exist
                existing_titles = set(
                    Title.objects.filter(company=company).values_list('description', flat=True)
                )

        for i in range(total_records):
            is_income = i % 2 == 0
            # Spread dates over last 6 months
            days_back = random.randint(0, 180)
            due_date = base_today - timedelta(days=days_back)
            amount_val = round(random.uniform(80.0, 2500.0), 2) if is_income else round(random.uniform(40.0, 1800.0), 2)
            amount = Decimal(str(amount_val))
            desc = ("Venda de serviço" if is_income else "Compra de insumos") + f" #{i+1}"
            # Skip if a title with same description already exists for this company
            if desc in existing_titles:
                continue

            title = Title.objects.create(
                company=company,
                description=desc,
                type_of='income' if is_income else 'expense',
                amount=amount,
                expiration_date=due_date,
                preset=preset,
            )
            existing_titles.add(desc)

            # Paid date within +/- 5 days from due_date
            paid_date = due_date + timedelta(days=random.randint(-2, 5))
            # Pick a billing account for the entry; prefer control accounts if available
            income_pool = []
            if 'receivable_control' in locals() and receivable_control:
                income_pool.append(receivable_control)
            income_pool += income_categories

            expense_pool = []
            if 'payable_control' in locals() and payable_control:
                expense_pool.append(payable_control)
            expense_pool += expense_categories

            if is_income:
                acc = random.choice(income_pool) if income_pool else random.choice(income_categories)
            else:
                acc = random.choice(expense_pool) if expense_pool else random.choice(expense_categories)

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