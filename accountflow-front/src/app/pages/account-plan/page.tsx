'use client';

import { useState, useEffect } from 'react';
import { Button, Modal, Label, TextInput } from 'flowbite-react';
import { HiOutlineChevronRight, HiOutlineChevronDown } from 'react-icons/hi';

type Conta = {
  id: string;
  classificacao: string;
  descricao: string;
  grau: number;
  total: number;
  subContas?: Conta[];
};

export default function PlanoDeContasPage() {
  const [contas, setContas] = useState<Conta[]>([]);

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);

  const [novaConta, setNovaConta] = useState({
    descricao: '',
    classificacao: '',
    grau: 1,
    parentId: '',
  });

  const toggleRow = (contaId: string) => {
    setExpandedRows((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(contaId)) newExpanded.delete(contaId);
      else newExpanded.add(contaId);
      return newExpanded;
    });
  };

  const renderRows = (contasList: Conta[], level: number): React.ReactNode[] => {
    const rows: React.ReactNode[] = [];

    contasList.forEach((conta) => {
      const isExpanded = expandedRows.has(conta.id);
      const hasChildren = conta.subContas && conta.subContas.length > 0;
      const paddingLeft = level * 24 + 16;

      const totalFormatado = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(conta.total);

      rows.push(
        <tr
          key={conta.id}
          className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          <td
            className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
            style={{ paddingLeft: `${paddingLeft}px` }}
          >
            <div className="flex items-center">
              {hasChildren ? (
                <button
                  onClick={() => toggleRow(conta.id)}
                  className="mr-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {isExpanded ? <HiOutlineChevronDown size={16} /> : <HiOutlineChevronRight size={16} />}
                </button>
              ) : (
                <span className="w-[24px] mr-2" />
              )}
              <svg className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.993.883L4 8v10a1 1 0 001 1h10a1 1 0 001-1V8l-.007-.117A1 1 0 0015 7h-1V6a4 4 0 00-4-4z" />
              </svg>
              {conta.descricao}
            </div>
          </td>
          <td className="px-6 py-4">{conta.classificacao}</td>
          <td className="px-6 py-4 font-medium">{totalFormatado}</td>
          <td className="px-6 py-4 text-right">
            <a href="#" className="font-medium text-cyan-600 hover:underline dark:text-cyan-500">
              Editar
            </a>
          </td>
        </tr>,
      );

      if (isExpanded && conta.subContas) {
        rows.push(...renderRows(conta.subContas, level + 1));
      }
    });

    return rows;
  };

  const gerarClassificacao = (parentId: string, contasList: Conta[]): string => {
    if (!parentId) {
      return (contasList.length + 1).toString();
    } else {
      const findConta = (id: string, lista: Conta[]): Conta | undefined => {
        for (const c of lista) {
          if (c.id === id) return c;
          if (c.subContas) {
            const found = findConta(id, c.subContas);
            if (found) return found;
          }
        }
        return undefined;
      };

      const parent = findConta(parentId, contasList);
      if (!parent) return '0';
      const seq = (parent.subContas?.length ?? 0) + 1;
      return `${parent.classificacao}.${seq}`;
    }
  };

  const adicionarConta = () => {
    if (novaConta.grau > 5) {
      alert('Não é possível adicionar uma conta com grau maior que 5.');
      return;
    }

    const classificacaoGerada = gerarClassificacao(novaConta.parentId, contas);

    const contaToAdd: Conta = {
      id: Math.random().toString(36).substr(2, 9),
      descricao: novaConta.descricao,
      classificacao: classificacaoGerada,
      grau: novaConta.grau,
      total: 0,
      subContas: [],
    };

    if (!novaConta.parentId) {
      setContas((prev) => [...prev, contaToAdd]);
    } else {
      const addSubConta = (contasList: Conta[]): Conta[] => {
        return contasList.map((c) => {
          if (c.id === novaConta.parentId) {
            return { ...c, subContas: [...(c.subContas || []), contaToAdd] };
          }
          if (c.subContas) return { ...c, subContas: addSubConta(c.subContas) };
          return c;
        });
      };
      setContas((prev) => addSubConta(prev));
    }

    setShowModal(false);
    setNovaConta({ descricao: '', classificacao: '', grau: 1, parentId: '' });
  };

  useEffect(() => {
    const findConta = (id: string, lista: Conta[]): Conta | undefined => {
      for (const c of lista) {
        if (c.id === id) return c;
        if (c.subContas) {
          const found = findConta(id, c.subContas);
          if (found) return found;
        }
      }
      return undefined;
    };

    const parentConta = novaConta.parentId ? findConta(novaConta.parentId, contas) : null;
    const grau = parentConta ? Math.min(parentConta.grau + 1, 5) : 1;

    setNovaConta((prev) => ({ ...prev, grau }));
  }, [novaConta.parentId, contas]);

  const gerarOpcoesPai = (contasList: Conta[], nivel = 0): { id: string; label: string }[] => {
    let opcoes: { id: string; label: string }[] = [];
    contasList.forEach((c) => {
      if (c.grau < 5) {
        opcoes.push({ id: c.id, label: `${'--'.repeat(nivel)} ${c.descricao}` });
        if (c.subContas && c.subContas.length > 0) {
          opcoes = [...opcoes, ...gerarOpcoesPai(c.subContas, nivel + 1)];
        }
      }
    });
    return opcoes;
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Plano de Contas</h1>
        <Button color="blue" onClick={() => setShowModal(true)}>
          Adicionar Conta
        </Button>
      </div>

      <p className="mb-6 text-gray-600 dark:text-gray-400">Gerencie as contas contábeis do sistema.</p>

      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Nome da conta
              </th>
              <th scope="col" className="px-6 py-3">
                Classificação
              </th>
              <th scope="col" className="px-6 py-3">
                Total
              </th>
              <th scope="col" className="px-6 py-3">
                <span className="sr-only">Editar</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {contas.length > 0 ? (
              renderRows(contas, 0)
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-400">
                  Nenhuma conta cadastrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Adicionar Conta</h2>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <TextInput
              id="descricao"
              value={novaConta.descricao}
              onChange={(e) => setNovaConta((prev) => ({ ...prev, descricao: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="classificacao">Classificação</Label>
            <TextInput id="classificacao" value={novaConta.classificacao} readOnly />
          </div>

          <div>
            <Label htmlFor="grau">Grau</Label>
            <TextInput id="grau" value={novaConta.grau} readOnly />
          </div>

          <div>
            <Label htmlFor="parentId">Conta Pai (opcional)</Label>
            <select
              id="parentId"
              value={novaConta.parentId}
              onChange={(e) => setNovaConta((prev) => ({ ...prev, parentId: e.target.value }))}
              className="w-full border rounded px-2 py-1"
            >
              <option value="">Nenhuma (Conta Principal)</option>
              {gerarOpcoesPai(contas).map((op) => (
                <option key={op.id} value={op.id}>
                  {op.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button color="blue" onClick={adicionarConta}>
              Salvar
            </Button>
            <Button color="gray" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
