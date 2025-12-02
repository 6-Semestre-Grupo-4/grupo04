import Link from 'next/link';

export default function Home() {
  return (
    <div className="bg-background min-h-screen p-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-foreground mb-6 text-3xl font-bold">Página de Início</h1>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* ---------------------------------------------------------------- */}
          {/* CARD DRE */}
          {/* ---------------------------------------------------------------- */}
          <Link href="/pages/reports/dre" className="group">
            <div className="border-border bg-surface shadow-card relative flex h-full flex-col overflow-hidden rounded-xl border p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-rose-500" />

              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-muted ring-border flex h-10 w-10 items-center justify-center rounded-lg ring-1">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-text h-5 w-5"
                    >
                      <path d="M3 13h18M3 17h12M3 9h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </div>
                  <h2 className="text-foreground text-lg font-semibold">Relatório DRE</h2>
                </div>
                <span className="text-primary text-xs transition-colors group-hover:underline">Abrir</span>
              </div>

              <p className="text-text-muted flex-1 text-sm">
                Demonstração do Resultado do Exercício (DRE). Analise receitas, despesas e resultado por mês, por conta,
                detalhes por dia e a estrutura clássica.
              </p>

              <div className="text-text-muted mt-4 flex items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1 whitespace-nowrap">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Resumo
                </span>
                <span className="inline-flex items-center gap-1 whitespace-nowrap">
                  <span className="h-2 w-2 rounded-full bg-blue-500" /> Por mês/conta
                </span>
                <span className="inline-flex items-center gap-1 whitespace-nowrap">
                  <span className="h-2 w-2 rounded-full bg-rose-500" /> Detalhes por dia
                </span>
              </div>
            </div>
          </Link>

          {/* ---------------------------------------------------------------- */}
          {/* CARD BALANCETE */}
          {/* ---------------------------------------------------------------- */}
          <Link href="/pages/reports/balancete" className="group">
            <div className="border-border bg-surface shadow-card relative flex h-full flex-col overflow-hidden rounded-xl border p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500" />

              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-muted ring-border flex h-10 w-10 items-center justify-center rounded-lg ring-1">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-text h-5 w-5"
                    >
                      <path
                        d="M4 4h16v4H4zM4 10h10v4H4zM4 16h7v4H4z"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  <h2 className="text-foreground text-lg font-semibold">Relatório Balancete</h2>
                </div>

                <span className="text-primary text-xs transition-colors group-hover:underline">Abrir</span>
              </div>

              <p className="text-text-muted flex-1 text-sm">
                Balancete contábil: visão completa de débitos, créditos e saldos com árvore do plano de contas.
              </p>

              <div className="text-text-muted mt-4 flex items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1 whitespace-nowrap">
                  <span className="h-2 w-2 rounded-full bg-indigo-500" /> Débitos / Créditos
                </span>
                <span className="inline-flex items-center gap-1 whitespace-nowrap">
                  <span className="h-2 w-2 rounded-full bg-blue-500" /> Saldo
                </span>
                <span className="inline-flex items-center gap-1 whitespace-nowrap">
                  <span className="h-2 w-2 rounded-full bg-purple-500" /> Estrutura em árvore
                </span>
              </div>
            </div>
          </Link>

          {/* ---------------------------------------------------------------- */}
          {/* CARD RAZÃO CONTÁBIL */}
          {/* ---------------------------------------------------------------- */}
          <Link href="/pages/reports/ledger" className="group">
            <div className="border-border bg-surface shadow-card relative flex h-full flex-col overflow-hidden rounded-xl border p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-muted ring-border flex h-10 w-10 items-center justify-center rounded-lg ring-1">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-text h-5 w-5"
                    >
                      <path
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <h2 className="text-foreground text-lg font-semibold">Razão Contábil</h2>
                </div>
                <span className="text-primary text-xs transition-colors group-hover:underline">Abrir</span>
              </div>

              <p className="text-text-muted flex-1 text-sm">
                Visualize o histórico detalhado de movimentações por conta contábil. Acompanhe débitos, créditos e
                saldos acumulados em tempo real.
              </p>

              <div className="text-text-muted mt-4 flex items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1 whitespace-nowrap">
                  <span className="h-2 w-2 rounded-full bg-blue-500" /> Movimentações
                </span>
                <span className="inline-flex items-center gap-1 whitespace-nowrap">
                  <span className="h-2 w-2 rounded-full bg-indigo-500" /> Saldos
                </span>
                <span className="inline-flex items-center gap-1 whitespace-nowrap">
                  <span className="h-2 w-2 rounded-full bg-purple-500" /> Histórico
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
