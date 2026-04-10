import fs from "fs/promises";
import path from "path";

const dbPath = path.resolve("src", "database", "obras.json");

async function readDB() {
    try {
        const data = await fs.readFile(dbPath, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            await fs.writeFile(dbPath, '[]');
            return [];
        }
        throw error;
    }
}

async function writeDB(data) {
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
}

export class ObraModel {
    static async findAll() {
        return await readDB();
    }

    /**
     * Encontra uma obra pelo seu ID.
     */
    static async findById(id) {
        const obras = await readDB();
        return obras.find(o => o.id_obra === id);
    }

    /**
     * Encontra todas as obras que pertencem a um usuário específico.
     */
    static async findByUserId(userId) {
        const obras = await readDB();
        return obras.filter(o => o.userId === userId);
    }

    /**
     * Adiciona uma nova obra ao banco de dados.
     */
    static async create(obra) {
        const obras = await readDB();
        obras.push(obra);
        await writeDB(obras);
        return obra;
    }

    /**
     * Atualiza uma obra existente.
     */
    static async update(id, newData) {
        const obras = await readDB();
        const index = obras.findIndex(o => o.id_obra === id);
        if (index === -1) return null;
        obras[index] = { ...obras[index], ...newData, data_atualizacao: new Date().toISOString() };
        await writeDB(obras);
        return obras[index];
    }

    /**
     * Deleta uma obra pelo seu ID.
     */
    static async delete(id) {
        let obras = await readDB();
        const initialLength = obras.length;
        obras = obras.filter(o => o.id_obra !== id);
        if (obras.length === initialLength) return false;
        await writeDB(obras);
        return true;
    }

    static async findByUserId(userId) {
        const obras = await this.findAll();
        return obras.filter(o => o.userId === Number(userId));
    }
}