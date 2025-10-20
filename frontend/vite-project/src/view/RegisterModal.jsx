// src/view/RegisterModal.jsx

import React, { useState } from "react";
import Button from "./components/Button.jsx";
import Card from "./components/Card.jsx";

function RegisterModal({ onClose, onRegisterSuccess }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await fetch('http://localhost:3000/api/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                alert("Cadastro realizado com sucesso! Agora você pode fazer o login.");
                onRegisterSuccess();
            } else {
                setError(data.erro || "Falha no cadastro");
            }
        } catch (err) {
            setError("Não foi possível conectar ao servidor.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div onClick={(e) => e.stopPropagation()}>
                <Card title="Criar Nova Conta">
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
                        <input type="text" placeholder="Novo Usuário" value={username} onChange={(e) => setUsername(e.target.value)} className="px-4 py-3 border rounded-lg" />
                        <input type="password" placeholder="Nova Senha" value={password} onChange={(e) => setPassword(e.target.value)} className="px-4 py-3 border rounded-lg" />
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        <Button type="submit">Cadastrar</Button>
                    </form>
                </Card>
            </div>
        </div>
    );
}

export default RegisterModal;