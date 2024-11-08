import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        message: 'Usuário e senha são obrigatórios' 
      });
    }

    const user = await prisma.user.findUnique({ 
      where: { username },
      select: {
        id: true,
        username: true,
        password: true
      }
    });

    if (!user) {
      return res.status(401).json({ 
        message: 'Usuário ou senha inválidos' 
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ 
        message: 'Usuário ou senha inválidos' 
      });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username 
      }, 
      JWT_SECRET, 
      { 
        expiresIn: '24h' 
      }
    );

    // Não enviar o hash da senha na resposta
    const { password: _, ...userWithoutPassword } = user;

    res.json({ 
      user: userWithoutPassword, 
      token 
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ 
      message: 'Erro interno do servidor ao realizar login' 
    });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        message: 'Usuário e senha são obrigatórios' 
      });
    }

    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'Este usuário já existe' 
      });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Criar novo usuário
    const user = await prisma.user.create({
      data: { 
        username, 
        password: hashedPassword 
      },
      select: {
        id: true,
        username: true
      }
    });

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ 
      message: 'Erro interno do servidor ao criar usuário' 
    });
  }
});

export const authRouter = router;