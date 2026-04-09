import React, { useState } from "react";

function MaterialCalculator() {
    const [itens, setItens] = useState([]);
    const [nome, setNome] = useState("");
    const [quantidade, setQuantidade] = useState("");
    const [preco, setPreco] = useState("");

    const adicionarItem = (e) => {
        e.preventDefault();
        if (!nome || !quantidade || !preco) {
            alert("Preencha todos os campos!");
            return;
        }
        const novoItem = {
            id: Date.now(),
            nome,
            quantidade: Number(quantidade),
            preco: Number(preco),
            total: Number(quantidade) * Number(preco),
        };
        setItens([...itens, novoItem]);
        setNome("");
        setQuantidade("");
        setPreco("");
    };

    const totalGeral = itens.reduce((acc, item) => acc + item.total, 0);

    return (
        <div>
            <h1 className="text-xl font-bold mb-4">Calculadora de Materiais</h1>
            <form onSubmit={adicionarItem} className="space-y-2 mb-4">
                <input
                    type="text"
                    placeholder="Nome do material"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="border p-2 w-full"
                />
                <input
                    type="number"
                    placeholder="Quantidade"
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                    className="border p-2 w-full"
                />
                <input
                    type="number"
                    placeholder="Preço unitário"
                    value={preco}
                    onChange={(e) => setPreco(e.target.value)}
                    className="border p-2 w-full"
                />
                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
                    Adicionar
                </button>
            </form>

            <ul>
                {itens.map((item) => (
                    <li key={item.id} className="border p-2 mb-2 rounded">
                        {item.nome} – {item.quantidade} × R$ {item.preco.toFixed(2)} ={" "}
                        <strong>R$ {item.total.toFixed(2)}</strong>
                    </li>
                ))}
            </ul>

            <div className="mt-4 p-2 border rounded bg-gray-100">
                <strong>Total Geral: R$ {totalGeral.toFixed(2)}</strong>
            </div>
        </div>
    );
}

export default MaterialCalculator;
    