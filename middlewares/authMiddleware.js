import jwt from 'jsonwebtoken';

export function authMiddleware(req, res, next) {
  try {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ erro: "Token não enviado" });
    }


    const [, token] = authHeader.split(" ");

    if (!token) {
      return res.status(401).json({ erro: "Token inválido" });
    }


    const secret = process.env.JWT_SECRET || "SUPER_SECRET";

    const decoded = jwt.verify(token, secret);


    req.user = decoded;

    return next();

  } catch (error) {
    console.error("Erro no middleware de autenticação:", error);
    return res.status(401).json({ erro: "Token expirado ou inválido" });
  }
}
