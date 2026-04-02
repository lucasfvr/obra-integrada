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

        // Verificações de unicidade
        if (user.email) {
            const existingEmail = users.find(u => u.email === user.email);
            if (existingEmail) {
                throw new Error("Este email já está cadastrado!");
            }
        }

        if (user.cpf) {
            const cpfClean = user.cpf.replace(/\D/g, "");
            const existingCPF = users.find(u => (u.cpf || "").replace(/\D/g, "") === cpfClean);
            if (existingCPF) {
                throw new Error("Este CPF já está cadastrado!");
            }
        }

        if (user.cnpj) {
            const cnpjClean = user.cnpj.replace(/\D/g, "");
            const existingCNPJ = users.find(u => (u.cnpj || "").replace(/\D/g, "") === cnpjClean);
            if (existingCNPJ) {
                throw new Error("Este CNPJ já está cadastrado!");
            }
        }

        if (user.formulario && user.formulario.inscricaoEstadual) {
            const inscricaoClean = user.formulario.inscricaoEstadual.replace(/\D/g, "");
            const existingInscricao = users.find(u => 
                u.formulario && (u.formulario.inscricaoEstadual || "").replace(/\D/g, "") === inscricaoClean
            );
            if (existingInscricao) {
                throw new Error("Esta inscrição estadual já está cadastrada!");
            }
        }

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
