import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET: string = (() => {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error('Variável de ambiente JWT_SECRET não definida.');
  return s;
})();
export const JWT_EXPIRES = '1d';

export interface JWTPayload {
  id:           number;
  email:        string;
  role:         'coordenador' | 'professor' | 'aluno';
  nome:         string;
  matricula:    string | null;
  trocar_senha: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

export function verifyToken(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token não fornecido.' });
    return;
  }
  try {
    req.user = jwt.verify(auth.slice(7), JWT_SECRET) as unknown as JWTPayload;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Acesso não autorizado.' });
      return;
    }
    next();
  };
}
