import jwt from 'jsonwebtoken';

const token = jwt.sign(
  {
    id: 3,
    username: 'rh_manager',
    role: 'RH',
    nome: 'Gerente de RH',
    id_cliente: 1,
    acesso_rh: true
  },
  process.env.JWT_SECRET || 'super-secret-key-para-local',
  { expiresIn: '1h' }
);

async function test() {
  const url = 'http://127.0.0.1:5000/api/rh/controle-acesso/usuarios';
  console.log("Fetching url:", url);
  console.log("Token used:", token);
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  console.log("Response status:", res.status);
  const data = await res.json();
  console.log("Response body:", JSON.stringify(data, null, 2));
}

test().catch(console.error);
