const jwt = require('jsonwebtoken');

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        message: 'Acceso denegado. Token no proporcionado.' 
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar que es un token de admin
    if (decoded.type !== 'admin') {
      return res.status(403).json({ 
        message: 'Acceso denegado. Se requiere privilegios de administrador.' 
      });
    }
    
    req.admin = decoded;
    next();
    
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expirado' 
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Token inválido' 
      });
    }
    
    console.error('Error en adminAuth:', error);
    res.status(500).json({ 
      message: 'Error al verificar autenticación' 
    });
  }
};

const superAdminAuth = async (req, res, next) => {
  try {
    // Primero verificar que es admin
    await adminAuth(req, res, () => {
      // Luego verificar que es super admin
      if (!req.admin.isSuperAdmin) {
        return res.status(403).json({ 
          message: 'Acceso denegado. Se requiere privilegios de super administrador.' 
        });
      }
      next();
    });
  } catch (error) {
    console.error('Error en superAdminAuth:', error);
    res.status(500).json({ 
      message: 'Error al verificar autenticación' 
    });
  }
};

module.exports = { adminAuth, superAdminAuth };