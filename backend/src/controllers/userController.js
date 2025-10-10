import { UserModel } from '../models/user.js';

export async function registerUser(req, res) {
    console.log('>>> CHEGOU NO CONTROLLER DE CADASTRO <<<');
    console.log('Dados recebidos:', req.body);
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ erro: "Usuário e senha são obrigatórios" });
        }

        const existingUser = await UserModel.findByUsername(username);
        if (existingUser) {
            return res.status(409).json({ erro: "Usuário já existe" });
        }

        const newUser = { id: Date.now(), username, password }; // Em um app real, use bcrypt para a senha

        await UserModel.create(newUser);
        res.status(201).json({ id: newUser.id, username: newUser.username });
    } catch (error) {
        res.status(500).json({ erro: "Erro ao registrar usuário" });
    }
}

export async function loginUser(req, res) {
    console.log('\n--- Nova Tentativa de Login ---');
    try {
        const { username, password } = req.body;
        console.log(`1. Dados recebidos do frontend: Usuário='${username}', Senha='${password}'`);

        const user = await UserModel.findByUsername(username);

        if (!user) {
            console.log('2. Resultado da Busca: Usuário não encontrado no users.json.');
            return res.status(401).json({ erro: "Credenciais inválidas" });
        }

        console.log(`2. Resultado da Busca: Usuário '${user.username}' encontrado no banco de dados.`);
        
        console.log(`3. Comparando senhas:`);
        console.log(`   - Senha do Banco   : '${user.password}' (Tipo: ${typeof user.password})`);
        console.log(`   - Senha do Frontend: '${password}' (Tipo: ${typeof password})`);

        if (user.password !== password) {
            console.log('4. Resultado da Comparação: As senhas NÃO SÃO IGUAIS.');
            return res.status(401).json({ erro: "Credenciais inválidas" });
        }

        console.log('4. Resultado da Comparação: As senhas SÃO IGUAIS. Login permitido.');
        res.status(200).json({ mensagem: "Login bem-sucedido!", user: { id: user.id, username: user.username } });

    } catch (error) {
        console.error('ERRO GERAL NO LOGIN:', error);
        res.status(500).json({ erro: "Erro ao fazer login" });
    }
}