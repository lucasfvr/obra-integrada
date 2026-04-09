import { useState, useEffect } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";

interface User {
  id: number;
  nome: string;
  email: string;
  funcao: string;
  status: "ativo" | "inativo";
  dataCadastro: string;
}

const USERS_PER_PAGE = 10;

const defaultUsers: User[] = [
  {
    id: 1,
    nome: "Carlos Silva",
    email: "carlos.silva@obra.com",
    funcao: "Gerente de Projetos",
    status: "ativo",
    dataCadastro: "2025-01-15",
  },
  {
    id: 2,
    nome: "Ana Costa",
    email: "ana.costa@obra.com",
    funcao: "Coordenadora de Obra",
    status: "ativo",
    dataCadastro: "2025-01-20",
  },
  {
    id: 3,
    nome: "João Pereira",
    email: "joao.pereira@obra.com",
    funcao: "Engenheiro Civil",
    status: "ativo",
    dataCadastro: "2025-02-01",
  },
  {
    id: 4,
    nome: "Maria Oliveira",
    email: "maria.oliveira@obra.com",
    funcao: "Arquiteta",
    status: "inativo",
    dataCadastro: "2025-02-05",
  },
  {
    id: 5,
    nome: "Pedro Santos",
    email: "pedro.santos@obra.com",
    funcao: "Supervisor de Obra",
    status: "ativo",
    dataCadastro: "2025-02-10",
  },
  {
    id: 6,
    nome: "Lucia Martins",
    email: "lucia.martins@obra.com",
    funcao: "Encarregada",
    status: "ativo",
    dataCadastro: "2025-02-15",
  },
  {
    id: 7,
    nome: "Roberto Ferreira",
    email: "roberto.ferreira@obra.com",
    funcao: "Mestre de Obra",
    status: "ativo",
    dataCadastro: "2025-02-20",
  },
  {
    id: 8,
    nome: "Patricia Gomes",
    email: "patricia.gomes@obra.com",
    funcao: "Administradora",
    status: "ativo",
    dataCadastro: "2025-03-01",
  },
  {
    id: 9,
    nome: "Felipe Rocha",
    email: "felipe.rocha@obra.com",
    funcao: "Técnico de Segurança",
    status: "ativo",
    dataCadastro: "2025-03-05",
  },
  {
    id: 10,
    nome: "Beatriz Alves",
    email: "beatriz.alves@obra.com",
    funcao: "Analista de Qualidade",
    status: "inativo",
    dataCadastro: "2025-03-10",
  },
  {
    id: 11,
    nome: "Gabriel Mendes",
    email: "gabriel.mendes@obra.com",
    funcao: "Desenhista Técnico",
    status: "ativo",
    dataCadastro: "2025-03-15",
  },
  {
    id: 12,
    nome: "Fernanda Torres",
    email: "fernanda.torres@obra.com",
    funcao: "Gerente Financeiro",
    status: "ativo",
    dataCadastro: "2025-03-20",
  },
];

export default function Users() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const [users, setUsers] = useState<User[]>(defaultUsers);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/users", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Falha ao carregar usuários (${response.status})`);
        }

        const data = (await response.json()) as User[];
        setUsers(data);
      } catch (fetchError) {
        if ((fetchError as any).name !== "AbortError") {
          setError((fetchError as Error).message || "Erro ao buscar usuários.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
    return () => controller.abort();
  }, []);

  // Filtrar usuários baseado no termo de pesquisa
  const filteredUsers = users.filter((user) =>
    user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedUsers = filteredUsers;
  const totalPages = Math.max(1, Math.ceil(displayedUsers.length / USERS_PER_PAGE));
  const startIndex = (currentPage - 1) * USERS_PER_PAGE;
  const endIndex = startIndex + USERS_PER_PAGE;
  const currentUsers = displayedUsers.slice(startIndex, endIndex);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusColor = (status: string) => {
    return status === "ativo"
      ? "bg-success-500 text-white"
      : "bg-gray-300 text-gray-700";
  };

  return (
    <>
      <PageMeta
        title="Usuários | Obra Integrada - Gestão de Construção"
        description="Página de gerenciamento de usuários cadastrados no painel Obra Integrada."
      />
      <PageBreadcrumb pageTitle="Usuários" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Usuários Cadastrados
          </h3>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-3">
            {/* Campo de Pesquisa */}
            <div className="relative flex-1 lg:flex-none lg:w-64">
              <input
                type="text"
                placeholder="Pesquisar por nome ou email..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
              />
              <svg
                className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 dark:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <button className="inline-flex items-center justify-center px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors whitespace-nowrap">
              + Novo Usuário
            </button>
          </div>
        </div>

        {/* Mensagem quando nenhum usuário é encontrado */}
        {searchTerm && filteredUsers.length === 0 && (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400">
            Nenhum usuário encontrado para "{searchTerm}"
          </div>
        )}

        {!loading && !error && users.length === 0 && (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400">
            Nenhum usuário cadastrado.
          </div>
        )}

        {/* Estado de carregamento / erro */}
        {loading ? (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">
            Carregando usuários...
          </div>
        ) : error ? (
          <div className="py-12 text-center text-red-500 dark:text-red-400">
            {error}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Nome
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Função
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Data Cadastro
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Status
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-300">
                        {user.nome}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {user.email}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {user.funcao}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(user.dataCadastro).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            user.status
                          )}`}
                        >
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-white/10 transition-colors">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.343a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM15.657 14.657a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM11 17a1 1 0 102 0v-1a1 1 0 10-2 0v1zM5.343 15.657a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414l-.707.707zM2 10a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.343 5.343a1 1 0 011.414-1.414l.707.707a1 1 0 01-1.414 1.414l-.707-.707zM10 13a3 3 0 100-6 3 3 0 000 6z" />
                            </svg>
                          </button>
                          <button className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-white/10 transition-colors">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                              <path
                                fillRule="evenodd"
                                d="M4 5a2 2 0 012-2 1 1 0 000-2 4 4 0 00-4 4v9a4 4 0 004 4h12a4 4 0 004-4V5a1 1 0 00-1-1 1 1 0 000 2 2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V5z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Mostrando {startIndex + 1} a {Math.min(endIndex, displayedUsers.length)} de{" "}
                {displayedUsers.length} usuários
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`inline-flex items-center justify-center w-10 h-10 rounded-lg font-medium transition-colors ${
                      currentPage === page
                        ? "bg-brand-500 text-white"
                        : "border border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/10"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
