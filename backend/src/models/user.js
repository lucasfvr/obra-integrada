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

    static async findById(id) {
        const users = await readDB();
        return users.find((u) => u.id == id);
    }

    // 🔥 Agora procura por username e por email
    static async findByUsername(usernameOrEmail) {
        const users = await readDB();
        return users.find(
            (u) => u.username === usernameOrEmail || u.email === usernameOrEmail
        );
    }

    static async create(user) {
        const users = await readDB();
        users.push(user);
        await writeDB(users);
        return user;
    }

    // 🔥 Versão segura do update que mantém campos antigos
    static async update(id, updatedUser) {
        const users = await readDB();
        const index = users.findIndex((u) => u.id == id);

        if (index === -1) return null;

        // Mesclar dados ao invés de substituir completamente
        users[index] = {
            ...users[index],
            ...updatedUser,
        };

        await writeDB(users);

        return users[index];
    }
}
