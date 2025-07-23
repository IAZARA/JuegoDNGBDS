const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

const authController = {
  async register(req, res) {
    try {
      const { username, email, password, fullName } = req.body;
      
      if (!username || !email || !password) {
        return res.status(400).json({ 
          message: 'Username, email y password son requeridos' 
        });
      }
      
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ 
          message: 'Ya existe un usuario con este email' 
        });
      }
      
      const existingUsername = await User.findByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ 
          message: 'Ya existe un usuario con este username' 
        });
      }
      
      const user = await User.create({ username, email, password, fullName });
      const token = generateToken(user.id);
      
      res.status(201).json({
        message: 'Usuario creado exitosamente',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.full_name,
          totalPoints: user.total_points,
          level: user.level
        },
        token
      });
      
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },
  
  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ 
          message: 'Email y password son requeridos' 
        });
      }
      
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ 
          message: 'Credenciales inválidas' 
        });
      }
      
      const isValidPassword = await User.validatePassword(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ 
          message: 'Credenciales inválidas' 
        });
      }
      
      const token = generateToken(user.id);
      
      res.json({
        message: 'Login exitoso',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.full_name,
          totalPoints: user.total_points,
          level: user.level
        },
        token
      });
      
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },
  
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      
      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.full_name,
          avatarUrl: user.avatar_url,
          totalPoints: user.total_points,
          level: user.level,
          createdAt: user.created_at
        }
      });
      
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
};

module.exports = authController;