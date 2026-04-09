import React, { useState } from "react";
import Button from "./components/Button.jsx";
import Card from "./components/Card.jsx";

function MaterialForm({ onAdicionar }) {
    const [nomeObra, setNomeObra] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (nomeObra.trim()) {
            onAdicionar(nomeObra);
            setNomeObra("");
        }
    };

    return (
        <Card title="Adicionar Nova Obra">
            <form onSubmit={handleSubmit} className="flex items-center gap-4">
                <input
                    type="text"
                    value={nomeObra}
                    onChange={(e) => setNomeObra(e.target.value)}
                    placeholder="Ex: Reforma da cozinha"
                    className="flex-grow px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <Button type="submit">Adicionar</Button>
            </form>
        </Card>
    );
}

export default MaterialForm;