import React, { useState, useEffect } from "react";
import ObrasList from "./ObraList.jsx";
import MaterialForm from "./MaterialForm.jsx";
import DashboardHeader from "./components/Header.jsx";

function Dashboard({ onLogout, currentUser, onNavigate }) {
    const [obras, setObras] = useState([]);
    const [loading, setLoading] = useState(true);

    const [comprimento, setComprimento] = useState("");
    const [largura, setLargura] = useState("");
    const [resultado, setResultado] = useState(null);

    const fetchObras = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:3000/api/obras?userId=${currentUser.id}`);
            const data = await response.json();
            if (response.ok) setObras(data);
            else console.error("Erro ao buscar obras:", data.erro);
        } catch (error) {
            console.error("Falha na conexão ao buscar obras:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchObras();
    }, [currentUser]);

    const handleAdicionarObra = async (nome_obra) => {
        try {
            const response = await fetch('http://localhost:3000/api/obras', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome_obra, userId: currentUser.id })
            });
            if (response.ok) fetchObras();
            else alert("Erro ao adicionar obra.");
        } catch (error) {
            alert("Falha na conexão ao adicionar obra.");
        }
    };

    const handleRemoverObra = async (obraId) => {
        try {
            const response = await fetch(`http://localhost:3000/api/obras/${obraId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.id })
            });
            if (response.ok) fetchObras();
            else alert("Erro ao remover obra.");
        } catch (error) {
            alert("Falha na conexão ao remover obra.");
        }
    };

    // Função da calculadora
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
        <div className="bg-slate-50 min-h-screen">
            <DashboardHeader
                currentUser={currentUser}
                onLogout={onLogout}
                onNavigate={onNavigate}
            />
            <main className="container mx-auto p-6">
                <h1 className="text-3xl font-bold mb-6 text-slate-800">
                    Dashboard de {currentUser.nome} {/* Aqui é mostrado o nome ao invés do username */}
                </h1>

                {/* Formulário de Obras */}
                <div className="mb-8">
                    <MaterialForm onAdicionar={handleAdicionarObra} />
                </div>

                {/* Lista de Obras */}
                <div className="mb-12">
                    <h2 className="text-2xl font-semibold mb-4 text-slate-700">
                        Minhas Obras
                    </h2>
                    {loading ? (
                        <p>Carregando obras...</p>
                    ) : (
                        <ObrasList obras={obras} onRemover={handleRemoverObra} />
                    )}
                </div>

                {/* Calculadora de Materiais */}
                <div className="bg-white p-6 rounded-xl shadow">
                    <h2 className="text-2xl font-semibold mb-4 text-slate-700">
                        Calculadora de Materiais
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="number"
                            placeholder="Comprimento (m)"
                            value={comprimento}
                            onChange={(e) => setComprimento(e.target.value)}
                            className="border p-2 rounded"
                        />
                        <input
                            type="number"
                            placeholder="Largura (m)"
                            value={largura}
                            onChange={(e) => setLargura(e.target.value)}
                            className="border p-2 rounded"
                        />
                    </div>
                    <button
                        onClick={calcularMateriais}
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Calcular
                    </button>

                    {resultado && (
                        <div className="mt-4 p-3 bg-gray-100 rounded">
                            <p><strong>Área:</strong> {resultado.area} m²</p>
                            <p><strong>Tijolos:</strong> {resultado.tijolos}</p>
                            <p><strong>Cimento:</strong> {resultado.cimento} sacos</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default Dashboard;
