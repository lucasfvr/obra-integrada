import React from "react";
import Button from "./components/Button.jsx";

function Obra({ obra, onRemover }) {
    return (
        <li className="flex justify-between items-center p-4 bg-white shadow rounded-lg">
            <div>
                <p className="font-semibold text-slate-800">{obra.nome || obra.descricao}</p>
                <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{obra.tb_status?.nome || obra.status}</span>
            </div>
            <Button variant="danger" onClick={() => onRemover(obra.id_obra || obra.id)}>
                Remover
            </Button>
        </li>
    );
}

export default Obra;
