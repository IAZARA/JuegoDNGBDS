# 🕵️‍♂️ CyberDetective Academy

Una plataforma gamificada de aprendizaje sobre seguridad digital y análisis de datos criminales basada en inteligencia artificial.

## 🎯 Descripción

CyberDetective Academy es una aplicación web interactiva donde los participantes se convierten en "detectives digitales" resolviendo casos prácticos basados en:

- **Análisis de Datos Criminales**: Limpieza y procesamiento de datasets sospechosos
- **Detección con IA**: Identificación de patrones y anomalías 
- **Investigación Digital**: Análisis de metadatos y evidencia digital
- **Ciberseguridad**: Detección de fraudes y validación de identidades

## 🏗️ Arquitectura

### Frontend
- **React 18** con Vite
- **React Router** para navegación
- **Axios** para API calls
- **Socket.io** para tiempo real
- **D3.js** para visualizaciones
- **Framer Motion** para animaciones

### Backend
- **Node.js** con Express
- **PostgreSQL** como base de datos
- **JWT** para autenticación
- **Socket.io** para WebSockets
- **Bcrypt** para encriptación

## 🚀 Instalación y Setup

### Prerrequisitos

- Node.js 18+
- PostgreSQL 14+
- npm o yarn

### 1. Clonar el repositorio

\`\`\`bash
git clone <repo-url>
cd cyberdetective-academy
\`\`\`

### 2. Setup del Backend

\`\`\`bash
cd backend
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL

# Inicializar base de datos
npm run init-db

# Ejecutar servidor
npm run dev
\`\`\`

El backend estará disponible en \`http://localhost:3001\`

### 3. Setup del Frontend

\`\`\`bash
cd frontend
npm install

# Ejecutar aplicación
npm run dev
\`\`\`

El frontend estará disponible en \`http://localhost:5173\`

## 🎮 Características

### Sistema de Gamificación
- **4 Niveles**: Detective Junior → Analista → Investigador Senior → Jefe de Inteligencia
- **15 Ejercicios** organizados por dificultad y temática
- **Sistema de Puntos** con rankings en tiempo real
- **Badges/Insignias** por logros específicos
- **Timer** y sistema de pistas para cada ejercicio

### Tipos de Ejercicios

#### Nivel 1: Detective Junior (10 pts c/u)
1. **Limpieza de Datos** - Identificar errores en datasets criminales
2. **Detección de Anomalías** - Encontrar transacciones sospechosas
3. **Validación de Identidades** - Detectar documentos falsos

#### Nivel 2: Analista de Datos (20 pts c/u)
4. **Análisis de Redes** - Identificar conexiones criminales
5. **Criptorastreo** - Seguir transacciones blockchain
6. **Dark Web Detective** - Analizar marketplaces ilegales
7. **Geolocalización** - Triangular ubicaciones

#### Nivel 3: Investigador Senior (30 pts c/u)
8. **Análisis Predictivo** - Predecir próximos objetivos
9. **Deepfake Hunter** - Identificar contenido manipulado
10. **Lavado de Dinero** - Detectar empresas fantasma
11. **Malware Analysis** - Analizar código malicioso

#### Nivel 4: Jefe de Inteligencia (40 pts c/u)
12. **Operación Encubierta** - Estrategia contra redes criminales
13. **Big Data Challenge** - Procesar millones de registros
14. **IA vs IA** - Detectar ataques generados por IA
15. **Caso Final** - Integrador de todas las habilidades

## 🛠️ Desarrollo

### Scripts Disponibles

#### Backend
\`\`\`bash
npm run dev      # Servidor con nodemon
npm start        # Servidor de producción
npm run init-db  # Inicializar base de datos
\`\`\`

#### Frontend
\`\`\`bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run preview  # Preview del build
\`\`\`

### Estructura del Proyecto

\`\`\`
cyberdetective-academy/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Lógica de controladores
│   │   ├── models/         # Modelos de datos
│   │   ├── routes/         # Rutas de API
│   │   ├── middleware/     # Middleware custom
│   │   ├── db/            # Configuración y esquemas DB
│   │   └── index.js       # Entry point
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── pages/         # Páginas principales
│   │   ├── contexts/      # React contexts
│   │   ├── services/      # API services
│   │   ├── hooks/         # Custom hooks
│   │   └── styles/        # Estilos CSS
│   ├── package.json
│   └── .env
└── README.md
\`\`\`

## 🔧 Configuración

### Variables de Entorno

#### Backend (.env)
\`\`\`env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/cyberdetective_db
JWT_SECRET=tu_super_secreto_jwt
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
\`\`\`

#### Frontend (.env)
\`\`\`env
VITE_API_URL=http://localhost:3001/api
\`\`\`

## 📊 Base de Datos

### Esquema Principal

- **users**: Información de usuarios y puntuaciones
- **exercises**: Ejercicios con problemas y soluciones
- **exercise_attempts**: Intentos y resultados de usuarios
- **badges**: Sistema de insignias y logros
- **user_badges**: Badges obtenidos por usuarios
- **leaderboard**: Ranking global de usuarios

## 🎨 UI/UX

### Diseño
- **Tema**: Dark mode con gradientes cyber
- **Colores**: Azul primario, púrpura secundario, verde success
- **Tipografía**: Inter font family
- **Iconos**: Emojis para accesibilidad universal

### Responsive
- Mobile-first design
- Breakpoint principal: 768px
- Grid layouts adaptativos

## 🔮 Próximas Características

- [ ] Motor de ejercicios con validación automática
- [ ] Implementación de los 15 ejercicios completos
- [ ] Sistema de rankings en tiempo real
- [ ] Visualizaciones interactivas con D3.js
- [ ] Sistema de hints y ayudas
- [ ] Modo multijugador
- [ ] Analytics avanzados
- [ ] Modo instructor/admin

## 🤝 Contribuir

1. Fork el proyecto
2. Crear feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit cambios (\`git commit -m 'Add: AmazingFeature'\`)
4. Push al branch (\`git push origin feature/AmazingFeature\`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver \`LICENSE\` para más detalles.

## 👥 Equipo

Basado en la presentación del **Mg. Maximiliano Scarimbolo** (Director Nacional de Gestión de Bases de Datos de Seguridad) y **Sub Inspector Ivan Zarate** (Coordinador de Desarrollo).

---

**🕵️‍♂️ ¡Conviértete en el mejor detective digital!**