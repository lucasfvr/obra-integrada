export default class Obra {
    constructor(id, descricao, status = "pendente") {
        this.id = id;
        this.descricao = descricao;
        this.status = status;
    }
}
