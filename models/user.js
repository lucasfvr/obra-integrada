import fs from "fs/promises";
import path from "path";

const dbPath = path.resolve("src", "database", "users.json");

async function readDB() {
    try {
        const data = await fs.readFile(dbPath, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        await fs.writeFile(dbPath, "[]");
        return [];
    }
}

async function writeDB(data) {
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
}

export class UserModel {
    static async findAll() {
        return await readDB();
    }

    static async findByUsername(username) {
        const users = await readDB();
        return users.find(u => u.username === username);
    }

    static async create(user) {
        console.log('>>> CHEGOU NO MODEL PARA SALVAR <<<');
        console.log('Usuário a ser salvo:', user);
        const users = await readDB();
        users.push(user);
        await writeDB(users);
        return user;
    }
}