import React from "react";
import Obra from "./Obra.jsx";

function ObrasList({ obras, onRemover }) {
    if (obras.length === 0) {
        return <p className="text-slate-500 text-center py-8">Nenhuma obra cadastrada ainda.</p>;
    }

    return (
        <ul className="space-y-4">
            {obras.map((obra) => (
                <Obra key={obra.id} obra={obra} onRemover={onRemover} />
            ))}
        </ul>
    );
}

export default ObrasList;