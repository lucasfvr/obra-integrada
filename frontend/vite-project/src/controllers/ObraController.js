import Obra from "../models/ObraModel.js";

export default class ObraController {
    constructor() {
        this.obras = [];
    }

    adicionarObra(descricao) {
        const nova = new Obra(Date.now(), descricao);
        this.obras.push(nova);
        return nova;
    }

    listarObras() {
        return this.obras;
    }

    atualizarStatus(id, novoStatus) {
        const obra = this.obras.find((o) => o.id === id);
        if (obra) {
            obra.status = novoStatus;
        }
    }

    removerObra(id) {
        this.obras = this.obras.filter((o) => o.id !== id);
    }
}
