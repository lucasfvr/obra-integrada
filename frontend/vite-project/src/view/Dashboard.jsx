import React, { useState, useEffect } from "react";
import ObrasList from "./ObraList.jsx";
import MaterialForm from "./MaterialForm.jsx";
import { useAuth } from "../hooks/useAuth.js";

function Dashboard({ onLogout, currentUser, onNavigate, onImpersonate }) {
    const { apiFetch } = useAuth();
    const [obras, setObras] = useState([]);
    const [loading, setLoading] = useState(true);

    const [comprimento, setComprimento] = useState("");
    const [largura, setLargura] = useState("");
    const [resultado, setResultado] = useState(null);

    const [adminView, setAdminView] = useState(false);
    const [allUsers, setAllUsers] = useState([]);

    const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'MASTER';

    const token = localStorage.getItem('obraToken') || '';

    const fetchAllUsers = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/admin/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setAllUsers(data);
            }
        } catch (err) {
            console.error("Erro ao listar usuarios", err);
        }
    };

    const handlePromoteAdmin = async (userId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ role: 'ADMIN' })
            });
            if (response.ok) fetchAllUsers();
        } catch (err) {
            alert('Falha ao promover');
        }
    };

    const handleDemoteAdmin = async (userId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ role: 'USER' })
            });
            if (response.ok) fetchAllUsers();
        } catch (err) {
            alert('Falha ao rebaixar');
        }
    };

    const fetchObras = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const response = await apiFetch(`http://localhost:5000/api/obras?userId=${currentUser.id || currentUser.id_usuario}`);
            const res = await response.json();
            if (response.ok) {
                // Suporte a { data, meta } ou array simples
                const data = Array.isArray(res) ? res : (res.data || []);
                setObras(data);
            }
        } catch (error) {
            console.error("Falha ao buscar obras:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchObras();
    }, [currentUser]);

    const handleAdicionarObra = async (nome_obra) => {
        try {
            const response = await apiFetch('http://localhost:5000/api/obras', {
                method: 'POST',
                body: JSON.stringify({ nome_obra, userId: currentUser.id || currentUser.id_usuario })
            });
            if (response.ok) fetchObras();
            else alert("Erro ao adicionar obra.");
        } catch (error) {
            alert("Falha na conexao ao adicionar obra.");
        }
    };

    const handleRemoverObra = async (obraId) => {
        try {
            const response = await apiFetch(`http://localhost:5000/api/obras/${obraId}`, {
                method: 'DELETE',
                body: JSON.stringify({ userId: currentUser.id || currentUser.id_usuario })
            });
            if (response.ok) fetchObras();
            else alert("Erro ao remover obra.");
        } catch (error) {
            alert("Falha na conexao ao remover obra.");
        }
    };

    const calcularMateriais = () => {
        const area = parseFloat(comprimento) * parseFloat(largura);
        if (!isNaN(area)) {
            setResultado({
                area,
                tijolos: Math.ceil(area * 20),
                cimento: Math.ceil(area * 0.5),
            });
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                        Ola, {currentUser?.nome || currentUser?.username}{" "}
                        {isAdmin && (
                            <span className="text-xs text-amber-500 font-medium ml-2">(Admin)</span>
                        )}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Bem-vindo ao seu painel de gestao de obras
                    </p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => {
                            setAdminView(!adminView);
                            if (!adminView) fetchAllUsers();
                        }}
                        className="bg-gray-900 hover:bg-gray-800 text-amber-400 border border-amber-500/30 px-4 py-2 rounded-lg shadow text-sm font-medium transition-colors"
                    >
                        {adminView ? "<- Voltar ao Dashboard" : "Painel Administrativo"}
                    </button>
                )}
            </div>

            {adminView ? (
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold mb-1 text-gray-800 dark:text-white">
                        Gestao de Contas
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
                        Gerencie os usuarios e seus niveis de acesso.
                    </p>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-b dark:border-gray-700">
                                <tr>
                                    <th className="p-3">ID</th>
                                    <th className="p-3">Nome</th>
                                    <th className="p-3">E-mail</th>
                                    <th className="p-3">Cargo</th>
                                    <th className="p-3">Acoes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {allUsers.map(u => (
                                    <tr key={u.id_usuario} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="p-3 text-gray-500">{u.id_usuario}</td>
                                        <td className="p-3 font-medium text-gray-800 dark:text-white">
                                            {u.nome || u.username}
                                        </td>
                                        <td className="p-3 text-gray-500">{u.email}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                                                u.role === 'ADMIN' || u.role === 'MASTER'
                                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                                                    : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                                            }`}>
                                                {u.role || 'USER'}
                                            </span>
                                        </td>
                                        <td className="p-3 flex gap-2 flex-wrap">
                                            {onImpersonate && (
                                                <button
                                                    onClick={() => onImpersonate({
                                                        id: u.id_usuario,
                                                        username: u.username,
                                                        email: u.email,
                                                        role: u.role,
                                                        nome: u.nome
                                                    })}
                                                    className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 text-xs border border-emerald-200 dark:border-emerald-800 px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 transition-colors"
                                                >
                                                    Ver Painel
                                                </button>
                                            )}
                                            {u.role !== 'ADMIN' && u.role !== 'MASTER' ? (
                                                <button
                                                    onClick={() => handlePromoteAdmin(u.id_usuario)}
                                                    className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 text-xs border border-indigo-200 dark:border-indigo-800 px-2 py-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                                                >
                                                    Promover Admin
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleDemoteAdmin(u.id_usuario)}
                                                    className="text-red-500 hover:text-red-700 dark:text-red-400 text-xs border border-red-200 dark:border-red-800 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                >
                                                    Rebaixar
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <>
                    <div className="mb-8">
                        <MaterialForm onAdicionar={handleAdicionarObra} />
                    </div>

                    <div className="mb-8">
                        <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">
                            Minhas Obras
                        </h2>
                        {loading ? (
                            <p className="text-gray-400">Carregando obras...</p>
                        ) : (
                            <ObrasList obras={obras} onRemover={handleRemoverObra} />
                        )}
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow border border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">
                            Calculadora de Materiais
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="number"
                                placeholder="Comprimento (m)"
                                value={comprimento}
                                onChange={(e) => setComprimento(e.target.value)}
                                className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white p-2 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none"
                            />
                            <input
                                type="number"
                                placeholder="Largura (m)"
                                value={largura}
                                onChange={(e) => setLargura(e.target.value)}
                                className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white p-2 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none"
                            />
                        </div>
                        <button
                            onClick={calcularMateriais}
                            className="mt-4 bg-amber-500 hover:bg-amber-600 text-gray-950 font-semibold px-5 py-2 rounded-lg transition-colors"
                        >
                            Calcular
                        </button>

                        {resultado && (
                            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 text-sm">
                                <p className="text-gray-700 dark:text-gray-300">
                                    <strong>Area:</strong> {resultado.area} m2
                                </p>
                                <p className="text-gray-700 dark:text-gray-300">
                                    <strong>Tijolos estimados:</strong> {resultado.tijolos}
                                </p>
                                <p className="text-gray-700 dark:text-gray-300">
                                    <strong>Sacos de cimento:</strong> {resultado.cimento}
                                </p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default Dashboard;
