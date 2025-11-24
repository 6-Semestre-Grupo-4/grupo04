import { Preset } from '@/types/preset';
import { Company } from '@/types/company';

export function replacePresetVariables(template: string, company?: Company | null): string {
  if (!template) return '';

  let result = template;

  if (company) {
    result = result.replace(/@nome_fantasia/gi, company.fantasy_name || '');
    result = result.replace(/@empresa/gi, company.fantasy_name || '');
    result = result.replace(/@razao_social/gi, company.fantasy_name || '');
    result = result.replace(/@empresa_npme/gi, company.social_reason || '');
  }

  return result.trim();
}

export function applyPresetToTitle(preset: Preset | null, company: Company | null | undefined): string {
  if (!preset?.description) return '';
  return replacePresetVariables(preset.description, company || undefined);
}
