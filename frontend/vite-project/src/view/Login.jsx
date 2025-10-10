import React, { useState } from "react";
import Button from "./components/Button.jsx";
import Card from "./components/Card.jsx";

function LoginModal({ onLogin, onClose }) {
    const [usuario, setUsuario] = useState("");
    const [senha, setSenha] = useState("");
    
    const [error, setError] = useState(""); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await fetch('http://localhost:3000/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: usuario, password: senha })
            });

            const data = await response.json();

            if (response.ok) {
                onLogin(data.user);
            } else {
                setError(data.erro || "Falha no login");
            }
        } catch (err) {
            setError("Não foi possível conectar ao servidor.");
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div onClick={(e) => e.stopPropagation()}>
                <Card title="Acessar Obra Integrada">
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold"
                    >
                        &times;
                    </button>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
                        <input
                            type="text"
                            placeholder="Usuário"
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value)}
                            className="px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            required
                        />
                        <input
                            type="password"
                            placeholder="Senha"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            className="px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            required
                        />
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        <Button type="submit">Entrar</Button>
                    </form>
                </Card>
            </div>
        </div>
    );
}

export default LoginModal;