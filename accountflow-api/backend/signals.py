from decimal import Decimal, ROUND_HALF_UP
from django.db import transaction
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.apps import apps
import logging

logger = logging.getLogger(__name__)

# ------------------------------------------------------------
# Utilidades
# ------------------------------------------------------------

def _dec(value):
    return Decimal(str(value)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

def _plan_from_preset(preset):
    if not preset:
        return None
    pa = getattr(preset, 'payable_account', None)
    ra = getattr(preset, 'receivable_account', None)
    return pa.billing_plan if pa else (ra.billing_plan if ra else None)

# ------------------------------------------------------------
# Criação de lançamentos contábeis
# ------------------------------------------------------------

def _create_journal(reference_type, reference_id, company, date, description, lines):
    JournalEntry = apps.get_model('backend', 'JournalEntry')
    JournalLine  = apps.get_model('backend', 'JournalLine')

    with transaction.atomic():

        # Impedir duplicação
        if JournalEntry.objects.filter(reference_type=reference_type, reference_id=str(reference_id)).exists():
            return

        # ---------------------------
        # Validação
        # ---------------------------
        total_debits  = Decimal('0.00')
        total_credits = Decimal('0.00')

        for l in lines:
            debit  = _dec(l.get('debit', 0))
            credit = _dec(l.get('credit', 0))
            total_debits  += debit
            total_credits += credit

        # Validação contábil
        if total_debits <= Decimal('0.00') or total_debits != total_credits:
            raise ValueError("Lançamento inconsistente: débitos e créditos devem ser iguais e positivos.")

        # ---------------------------
        # Criar JournalEntry
        # ---------------------------
        je = JournalEntry.objects.create(
            date=date,
            description=description or '',
            company=company,
            reference_type=reference_type,
            reference_id=str(reference_id)
        )

        # ---------------------------
        # Criar JournalLines
        # ---------------------------
        for l in lines:
            JournalLine.objects.create(
                journal=je,
                account=l['account'],
                debit=_dec(l.get('debit', 0)),
                credit=_dec(l.get('credit', 0)),
                memo=l.get('memo', '')
            )

        je.total_debits  = total_debits
        je.total_credits = total_credits
        je.save(update_fields=['total_debits', 'total_credits'])

# ------------------------------------------------------------
# Signals — Title criado
# ------------------------------------------------------------

@receiver(post_save, sender=apps.get_model('backend', 'Title'))
def _on_title_created(sender, instance, created, **kwargs):
    if not created:
        return

    Title  = instance
    Preset = apps.get_model('backend', 'Preset')

    preset = Preset.objects.filter(pk=Title.preset_id).first() if Title.preset_id else None
    plan   = _plan_from_preset(preset)
    if not plan:
        return

    # Resolve control accounts safely: prefer explicit plan fields, but fall back to
    # searching by common names or by finding analytic children under top-level
    # synthetic accounts. This avoids AttributeError when BillingPlan model does
    # not define these FK fields.
    BillingAccount = apps.get_model('backend', 'BillingAccount')

    receivable_ctrl = getattr(plan, 'receivable_control_account', None)
    payable_ctrl = getattr(plan, 'payable_control_account', None)

    if not receivable_ctrl:
        receivable_ctrl = BillingAccount.objects.filter(
            billing_plan=plan,
            account_type=BillingAccount.AccountType.ANALYTIC,
            name__icontains='receb'
        ).first()
    if not receivable_ctrl:
        parent = BillingAccount.objects.filter(
            billing_plan=plan,
            account_type=BillingAccount.AccountType.SYNTHETIC,
            name__icontains='Receitas'
        ).first()
        if parent:
            receivable_ctrl = BillingAccount.objects.filter(
                billing_plan=plan,
                parent=parent,
                account_type=BillingAccount.AccountType.ANALYTIC,
            ).first()

    if not payable_ctrl:
        payable_ctrl = BillingAccount.objects.filter(
            billing_plan=plan,
            account_type=BillingAccount.AccountType.ANALYTIC,
            name__icontains='pag'
        ).first()
    if not payable_ctrl:
        parent = BillingAccount.objects.filter(
            billing_plan=plan,
            account_type=BillingAccount.AccountType.SYNTHETIC,
            name__icontains='Despesas'
        ).first()
        if parent:
            payable_ctrl = BillingAccount.objects.filter(
                billing_plan=plan,
                parent=parent,
                account_type=BillingAccount.AccountType.ANALYTIC,
            ).first()

    amount  = _dec(Title.amount)
    company = Title.company
    date    = getattr(Title, 'created_at', None) or Title.expiration_date
    desc    = f'Título: {Title.description} - criação'

    BillingAccount = apps.get_model('backend', 'BillingAccount')

    if Title.type_of == 'income' and receivable_ctrl:
        revenue_acc = getattr(preset, 'revenue_account', None)
        if not revenue_acc:
            logger.warning('Preset %s sem revenue_account; título %s criado sem lançamento.',
                           preset.name if preset else 'N/A', Title.uuid)
            return
        if receivable_ctrl.account_type != BillingAccount.AccountType.ANALYTIC:
            logger.error('Conta de controle de recebíveis não analítica para plano %s.', plan.uuid)
            return
        if revenue_acc.account_type != BillingAccount.AccountType.ANALYTIC:
            logger.error('Conta de receita não analítica no preset %s.', getattr(preset, 'uuid', 'N/A'))
            return
        try:
            _create_journal(
                'title_creation', Title.uuid, company, date, desc,
                [
                    {'account': receivable_ctrl, 'debit': amount},
                    {'account': revenue_acc,     'credit': amount}
                ]
            )
        except Exception:
            logger.exception('Falha ao criar lançamento (title_creation) para título %s', Title.uuid)

    elif Title.type_of == 'expense' and payable_ctrl:
        expense_acc = getattr(preset, 'expense_account', None)
        if not expense_acc:
            logger.warning('Preset %s sem expense_account; título %s criado sem lançamento.',
                           preset.name if preset else 'N/A', Title.uuid)
            return
        if payable_ctrl.account_type != BillingAccount.AccountType.ANALYTIC:
            logger.error('Conta de controle de pagamentos não analítica para plano %s.', plan.uuid)
            return
        if expense_acc.account_type != BillingAccount.AccountType.ANALYTIC:
            logger.error('Conta de despesa não analítica no preset %s.', getattr(preset, 'uuid', 'N/A'))
            return
        try:
            _create_journal(
                'title_creation', Title.uuid, company, date, desc,
                [
                    {'account': expense_acc,  'debit': amount},
                    {'account': payable_ctrl, 'credit': amount}
                ]
            )
        except Exception:
            logger.exception('Falha ao criar lançamento (title_creation) para título %s', Title.uuid)
# ------------------------------------------------------------
# Signals — Entry criado (baixa)
# ------------------------------------------------------------

@receiver(post_save, sender=apps.get_model('backend', 'Entry'))
def _on_entry_created(sender, instance, created, **kwargs):
    if not created:
        return

    Entry  = instance
    Title  = Entry.title
    Preset = apps.get_model('backend', 'Preset')

    preset = Preset.objects.filter(pk=Title.preset_id).first() if Title.preset_id else None
    plan   = _plan_from_preset(preset)
    if not plan or not Entry.billing_account:
        return

    # Resolve control accounts for this plan (same logic as above)
    BillingAccount = apps.get_model('backend', 'BillingAccount')
    receivable_ctrl = getattr(plan, 'receivable_control_account', None)
    payable_ctrl = getattr(plan, 'payable_control_account', None)
    if not receivable_ctrl:
        receivable_ctrl = BillingAccount.objects.filter(
            billing_plan=plan,
            account_type=BillingAccount.AccountType.ANALYTIC,
            name__icontains='receb'
        ).first()
    if not receivable_ctrl:
        parent = BillingAccount.objects.filter(
            billing_plan=plan,
            account_type=BillingAccount.AccountType.SYNTHETIC,
            name__icontains='Receitas'
        ).first()
        if parent:
            receivable_ctrl = BillingAccount.objects.filter(
                billing_plan=plan,
                parent=parent,
                account_type=BillingAccount.AccountType.ANALYTIC,
            ).first()
    if not payable_ctrl:
        payable_ctrl = BillingAccount.objects.filter(
            billing_plan=plan,
            account_type=BillingAccount.AccountType.ANALYTIC,
            name__icontains='pag'
        ).first()
    if not payable_ctrl:
        parent = BillingAccount.objects.filter(
            billing_plan=plan,
            account_type=BillingAccount.AccountType.SYNTHETIC,
            name__icontains='Despesas'
        ).first()
        if parent:
            payable_ctrl = BillingAccount.objects.filter(
                billing_plan=plan,
                parent=parent,
                account_type=BillingAccount.AccountType.ANALYTIC,
            ).first()

    amount  = _dec(Entry.amount)
    company = Title.company
    date    = Entry.paid_at
    desc    = f'Baixa do título {Title.description}'
    cash    = Entry.billing_account

    if Title.type_of == 'income' and receivable_ctrl:
        if receivable_ctrl.account_type != BillingAccount.AccountType.ANALYTIC:
            logger.error('Conta de controle de recebíveis não analítica para plano %s.', plan.uuid)
            return
        if cash.account_type != BillingAccount.AccountType.ANALYTIC:
            logger.error('Conta financeira não analítica para entry %s.', Entry.uuid)
            return
        try:
            _create_journal(
                'title_settlement', str(Entry.uuid), company, date, desc,
                [
                    {'account': receivable_ctrl, 'credit': amount},
                    {'account': cash,            'debit' : amount}
                ]
            )
        except Exception:
            logger.exception('Falha ao criar lançamento (title_settlement) para entry %s', Entry.uuid)

    elif Title.type_of == 'expense' and payable_ctrl:
        if payable_ctrl.account_type != BillingAccount.AccountType.ANALYTIC:
            logger.error('Conta de controle de pagamentos não analítica para plano %s.', plan.uuid)
            return
        if cash.account_type != BillingAccount.AccountType.ANALYTIC:
            logger.error('Conta financeira não analítica para entry %s.', Entry.uuid)
            return
        try:
            _create_journal(
                'title_settlement', str(Entry.uuid), company, date, desc,
                [
                    {'account': payable_ctrl, 'debit': amount},
                    {'account': cash,         'credit': amount}
                ]
            )
        except Exception:
            logger.exception('Falha ao criar lançamento (title_settlement) para entry %s', Entry.uuid)
# ------------------------------------------------------------
# Signals — Estorno ao deletar Entry
# ------------------------------------------------------------

@receiver(post_delete, sender=apps.get_model('backend', 'Entry'))
def _on_entry_deleted(sender, instance, **kwargs):
    JournalEntry = apps.get_model('backend', 'JournalEntry')
    JournalLine  = apps.get_model('backend', 'JournalLine')

    original = JournalEntry.objects.filter(
        reference_type='title_settlement',
        reference_id=str(instance.uuid)
    ).first()

    if not original:
        return

    lines = []
    for l in JournalLine.objects.filter(journal=original):
        lines.append({
            'account': l.account,
            'debit'  : _dec(l.credit),
            'credit' : _dec(l.debit),
            'memo'   : f'Estorno: {original.description}'
        })

    if lines:
        _create_journal(
            'title_settlement_reversal',
            f'settle-rev:{instance.uuid}',
            original.company,
            instance.paid_at,
            f'Estorno baixa: {original.description}',
            lines
        )
