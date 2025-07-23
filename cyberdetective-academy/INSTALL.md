# 🚀 Guía de Instalación Rápida - CyberDetective Academy

## 📋 Prerrequisitos

- **Node.js 18+**
- **PostgreSQL 14+** 
- **npm** o yarn

## ⚡ Instalación Rápida

### 1. Configurar PostgreSQL

```bash
# Crear usuario y base de datos
sudo -u postgres psql
CREATE USER cyberdetective WITH ENCRYPTED PASSWORD 'cyberdetective123';
CREATE DATABASE cyberdetective_db OWNER cyberdetective;
GRANT ALL PRIVILEGES ON DATABASE cyberdetective_db TO cyberdetective;
\q
```

### 2. Configurar Backend

```bash
cd backend
npm install

# Configurar variables de entorno (ya está el .env)
# Inicializar base de datos con esquemas y datos de ejemplo
node src/db/init-db.js

# Ejecutar servidor backend
npm run dev
```

**Backend corriendo en:** `http://localhost:3001`

### 3. Configurar Frontend

```bash
# En otra terminal
cd frontend
npm install

# Ejecutar aplicación React
npm run dev
```

**Frontend corriendo en:** `http://localhost:5173`

## 🎯 Probar la Aplicación

1. **Abrir**: `http://localhost:5173`
2. **Registrarse** con cualquier email/password
3. **Ir a Ejercicios** y resolver el primer ejercicio
4. **Ver el ranking** actualizado en tiempo real

## 🧪 Ejercicios Incluidos

### Nivel 1 - Detective Junior (5 ejercicios)
1. **Limpieza de Datos** - Detectar fecha inválida
2. **Anomalías Financieras** - Encontrar transacción sospechosa
3. **Validación de Identidades** - Documento con metadatos incorrectos
4. **IPs Sospechosas** - Detectar ataque de fuerza bruta
5. **Detector de Phishing** - Identificar email malicioso

### Nivel 2 - Analista de Datos (2 ejercicios)
6. **Red Criminal** - Identificar líder de la red
7. **Criptomonedas** - Seguir cadena de Bitcoin

## 🎮 Características Funcionales

✅ **Sistema de autenticación completo**  
✅ **Motor de ejercicios con validación automática**  
✅ **Timer por ejercicio**  
✅ **Sistema de pistas con penalizaciones**  
✅ **Ranking en tiempo real**  
✅ **Progreso por nivel**  
✅ **UI responsive moderna**  

## 🔧 Troubleshooting

### Error de conexión a PostgreSQL
```bash
# Verificar que PostgreSQL esté corriendo
sudo service postgresql status
sudo service postgresql start
```

### Puerto ocupado
```bash
# Backend (cambiar PORT en .env)
PORT=3002 npm run dev

# Frontend (Vite preguntará automáticamente por otro puerto)
npm run dev
```

### Base de datos no inicializada
```bash
cd backend
node src/db/init-db.js
```

## 🎉 ¡Todo Listo!

Ahora puedes convertirte en el mejor detective digital resolviendo casos de:
- 🧹 Limpieza de datos criminales
- 🔍 Detección de patrones sospechosos  
- 🛡️ Análisis de fraudes digitales
- 🌐 Investigación de redes criminales
- ₿ Rastreo de criptomonedas

**¡Que comience la investigación!** 🕵️‍♂️