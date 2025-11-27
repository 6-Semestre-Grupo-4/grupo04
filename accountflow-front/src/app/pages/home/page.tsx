import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">Página de Início</h1>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* DRE report card */}
          <Link href="/pages/reports/dre" className="group">
            <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
              {/* Accent bar */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-rose-500" />

              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 ring-1 ring-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:ring-emerald-800">
                    {/* simple inline icon */}
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5">
                      <path d="M3 13h18M3 17h12M3 9h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Relatório DRE</h2>
                </div>
                <span className="text-xs text-blue-600 transition-colors group-hover:underline dark:text-blue-300">Abrir</span>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300">
                Demonstração do Resultado do Exercício (DRE). Analise receitas, despesas e resultado por mês, por conta, detalhes por dia e a estrutura clássica.
              </p>

              {/* Footer stats hint */}
              <div className="mt-4 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Resumo
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-blue-500" /> Por mês/conta
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-rose-500" /> Detalhes por dia
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
