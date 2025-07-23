# 🏆 Plan de Sistema de Equipos - Academia de Detectives

## 📋 Resumen Ejecutivo

Este documento detalla el plan para implementar un sistema de equipos que permita a los usuarios agruparse en equipos de 4-5 personas para resolver ejercicios de manera colaborativa, competir en rankings grupales y fomentar el aprendizaje cooperativo.

## 🎯 Objetivos

### Objetivo Principal
- Permitir que usuarios se agrupen en equipos de 4-5 miembros para resolver ejercicios colaborativamente

### Objetivos Secundarios
- Fomentar el trabajo en equipo y aprendizaje colaborativo
- Crear rankings y competencias entre equipos
- Implementar ejercicios exclusivos para equipos
- Generar dinámicas sociales dentro de la plataforma

---

## 🏗️ Arquitectura del Sistema

### 1. Estructura de Base de Datos

#### Tabla: `teams`
```sql
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    leader_id INTEGER REFERENCES users(id),
    max_members INTEGER DEFAULT 5,
    current_members INTEGER DEFAULT 1,
    team_avatar VARCHAR(255),
    total_points INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);
```

#### Tabla: `team_members`
```sql
CREATE TABLE team_members (
    id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role ENUM('leader', 'member') DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    contribution_points INTEGER DEFAULT 0,
    UNIQUE(user_id) -- Un usuario solo puede estar en un equipo
);
```

#### Tabla: `team_invitations`
```sql
CREATE TABLE team_invitations (
    id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    invited_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    invited_by_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    status ENUM('pending', 'accepted', 'rejected', 'expired') DEFAULT 'pending',
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days'),
    UNIQUE(team_id, invited_user_id)
);
```

#### Tabla: `team_exercise_attempts`
```sql
CREATE TABLE team_exercise_attempts (
    id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    exercise_id INTEGER REFERENCES exercises(id) ON DELETE CASCADE,
    started_by_id INTEGER REFERENCES users(id),
    is_completed BOOLEAN DEFAULT FALSE,
    points_earned INTEGER DEFAULT 0,
    total_time INTEGER, -- tiempo total del equipo
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    final_answer TEXT,
    UNIQUE(team_id, exercise_id)
);
```

#### Tabla: `team_member_contributions`
```sql
CREATE TABLE team_member_contributions (
    id SERIAL PRIMARY KEY,
    team_attempt_id INTEGER REFERENCES team_exercise_attempts(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    contribution_type ENUM('answer', 'hint_request', 'discussion', 'final_submission'),
    contribution_data JSON,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Funcionalidades Core

#### A. Gestión de Equipos

**Crear Equipo:**
- Líder crea equipo con nombre y descripción
- Sistema asigna automáticamente rol de líder
- Límite de 5 miembros por equipo

**Invitar Miembros:**
- Solo el líder puede enviar invitaciones
- Invitaciones por username/email
- Sistema de notificaciones para invitados
- Expiración automática en 7 días

**Gestión de Miembros:**
- Líder puede remover miembros
- Miembros pueden abandonar equipo
- Transferencia de liderazgo
- Disolución automática si queda solo 1 miembro

#### B. Sistema de Ejercicios Colaborativos

**Modo Equipo:**
- Ejercicios resueltos colaborativamente
- Chat en tiempo real durante resolución
- Votación para respuesta final
- Tiempo límite compartido

**Contribuciones Individuales:**
- Tracking de aportes por miembro
- Puntos individuales dentro del equipo
- Estadísticas de participación

#### C. Rankings y Competencias

**Ranking de Equipos:**
- Basado en puntos totales acumulados
- Ranking por categorías de ejercicios
- Torneos y competencias temporales

**Estadísticas de Equipo:**
- Ejercicios completados
- Tiempo promedio de resolución
- Especialización por categorías
- Progreso individual de miembros

---

## 🎨 Diseño de Interfaz

### 1. Navegación Principal
- Nueva pestaña "🏃‍♂️ Mi Equipo" en navbar
- Indicador visual de equipo en perfil de usuario

### 2. Dashboard de Equipo
```
┌─────────────────────────────────────┐
│ 🏃‍♂️ Equipo: [Nombre del Equipo]     │
├─────────────────────────────────────┤
│ 👑 Líder: [Nombre]                  │
│ 👥 Miembros: 4/5                    │
│ 🏆 Puntos: 1,250                    │
│ 📊 Ejercicios: 15 completados       │
└─────────────────────────────────────┘

┌─── Miembros del Equipo ─────────────┐
│ 👑 [Líder]     1,250 pts   [Stats] │
│ 👤 [Miembro1]    980 pts   [Stats] │
│ 👤 [Miembro2]    750 pts   [Stats] │
│ 👤 [Miembro3]    890 pts   [Stats] │
│ ➕ Invitar nuevo miembro            │
└─────────────────────────────────────┘

┌─── Ejercicios de Equipo ────────────┐
│ 🎯 [Ejercicio 1] ✅ Completado      │
│ 🎯 [Ejercicio 2] 🔄 En progreso     │
│ 🎯 [Ejercicio 3] 🆕 Nuevo           │
└─────────────────────────────────────┘
```

### 3. Ejercicios Colaborativos
```
┌─── Detective de Redes Criminales ───┐
│ 👥 Modo Equipo - 4/5 participando   │
│ ⏱️ Tiempo: 5:23 restante           │
├─────────────────────────────────────┤
│ [Contenido del Ejercicio]           │
├─────────────────────────────────────┤
│ 💬 Chat del Equipo                  │
│ [Usuario1]: Creo que es la opción B │
│ [Usuario2]: ¿Por qué no la C?       │
│ [Tú]: Analicemos los datos...       │
│ [Escribir mensaje...]               │
├─────────────────────────────────────┤
│ 🗳️ Votación de Respuesta            │
│ A) Opción A     👤👤 (2 votos)      │
│ B) Opción B     👤 (1 voto)         │
│ C) Opción C     👤 (1 voto)         │
│                                     │
│ [Votar] [Cambiar Voto] [Finalizar]  │
└─────────────────────────────────────┘
```

---

## ⚙️ Implementación Técnica

### 1. Backend (Node.js/Express)

#### Nuevos Modelos
```javascript
// models/Team.js
class Team {
  static async create(teamData, leaderId)
  static async findById(teamId)
  static async addMember(teamId, userId)
  static async removeMember(teamId, userId)
  static async updatePoints(teamId, points)
  static async getTeamRanking(limit = 20)
}

// models/TeamInvitation.js
class TeamInvitation {
  static async create(teamId, invitedUserId, invitedById)
  static async respond(invitationId, response)
  static async getByUserId(userId)
  static async expireOldInvitations()
}

// models/TeamExercise.js
class TeamExercise {
  static async startTeamExercise(teamId, exerciseId, startedById)
  static async submitTeamAnswer(attemptId, answer, votingData)
  static async addContribution(attemptId, userId, contribution)
}
```

#### Nuevas Rutas
```javascript
// routes/teams.routes.js
POST   /teams                    // Crear equipo
GET    /teams/:id                // Obtener equipo
PUT    /teams/:id                // Actualizar equipo
DELETE /teams/:id                // Disolver equipo
POST   /teams/:id/invite         // Invitar miembro
POST   /teams/:id/join           // Unirse a equipo
DELETE /teams/:id/members/:userId // Remover miembro
GET    /teams/:id/exercises      // Ejercicios de equipo
POST   /teams/:id/exercises/:exerciseId/start // Iniciar ejercicio
POST   /team-attempts/:id/submit // Enviar respuesta de equipo

// routes/invitations.routes.js
GET    /invitations              // Mis invitaciones
POST   /invitations/:id/accept   // Aceptar invitación
POST   /invitations/:id/reject   // Rechazar invitación
```

#### WebSocket para Colaboración
```javascript
// socket/teamSocket.js
io.on('connection', (socket) => {
  socket.on('join-team-exercise', (teamId, exerciseId) => {
    socket.join(`team-${teamId}-exercise-${exerciseId}`);
  });
  
  socket.on('team-chat-message', (data) => {
    io.to(`team-${data.teamId}-exercise-${data.exerciseId}`)
      .emit('chat-message', data);
  });
  
  socket.on('team-vote', (data) => {
    io.to(`team-${data.teamId}-exercise-${data.exerciseId}`)
      .emit('vote-update', data);
  });
});
```

### 2. Frontend (React)

#### Nuevos Componentes
```jsx
// components/teams/
TeamDashboard.jsx         // Dashboard principal del equipo
TeamMembers.jsx           // Lista de miembros
TeamInvitations.jsx       // Gestión de invitaciones
TeamExercisePlayer.jsx    // Reproductor colaborativo
TeamChat.jsx              // Chat en tiempo real
TeamVoting.jsx            // Sistema de votación
TeamStats.jsx             // Estadísticas del equipo

// pages/
Teams.jsx                 // Página principal de equipos
CreateTeam.jsx            // Crear nuevo equipo
JoinTeam.jsx              // Unirse a equipo
TeamRanking.jsx           // Ranking de equipos
```

#### Servicios
```javascript
// services/teamService.js
export const teamService = {
  createTeam: (teamData) => api.post('/teams', teamData),
  getMyTeam: () => api.get('/teams/my-team'),
  inviteMember: (teamId, username) => api.post(`/teams/${teamId}/invite`, { username }),
  joinTeam: (invitationId) => api.post(`/invitations/${invitationId}/accept`),
  startTeamExercise: (teamId, exerciseId) => api.post(`/teams/${teamId}/exercises/${exerciseId}/start`),
  submitTeamAnswer: (attemptId, answerData) => api.post(`/team-attempts/${attemptId}/submit`, answerData)
};
```

---

## 🎮 Flujo de Usuario

### 1. Creación de Equipo
1. Usuario hace clic en "Crear Equipo"
2. Completa formulario (nombre, descripción)
3. Sistema crea equipo y asigna liderazgo
4. Redirección a dashboard del equipo

### 2. Invitación de Miembros
1. Líder busca usuarios por username
2. Envía invitación con mensaje opcional
3. Sistema notifica al usuario invitado
4. Invitado acepta/rechaza desde notificaciones

### 3. Resolución Colaborativa
1. Equipo selecciona ejercicio
2. Sistema abre sala colaborativa
3. Miembros discuten en chat tiempo real
4. Cada miembro puede votar por respuesta
5. Líder o mayoría finaliza ejercicio
6. Puntos se distribuyen según contribución

### 4. Gestión de Equipo
1. Líder puede remover miembros
2. Miembros pueden abandonar equipo
3. Transferencia de liderazgo disponible
4. Disolución automática con <2 miembros

---

## 📊 Sistema de Puntuación

### 1. Puntos de Equipo
- **Ejercicios Colaborativos**: Puntos base × multiplicador de equipo
- **Multiplicador**: Basado en participación y tiempo
- **Bonificaciones**: Por completar ejercicios en secuencia

### 2. Contribución Individual
- **Puntos de Participación**: Por mensajes útiles en chat
- **Puntos de Liderazgo**: Por iniciar discusiones
- **Puntos de Resolución**: Por votar respuesta correcta
- **Bonus de Velocidad**: Por respuestas rápidas y correctas

### 3. Rankings
- **Global de Equipos**: Por puntos totales
- **Por Categoría**: Especialización en tipos de ejercicios
- **Eficiencia**: Tiempo promedio vs puntos obtenidos
- **Consistencia**: Ejercicios completados consecutivamente

---

## 🔒 Consideraciones de Seguridad

### 1. Control de Acceso
- Validación de permisos para acciones de líder
- Prevención de spam en invitaciones
- Límites de equipos por usuario (1 activo)

### 2. Integridad de Datos
- Validación de votaciones (un voto por usuario)
- Prevención de manipulación de puntos
- Auditoría de contribuciones

### 3. Moderación
- Reportes de conducta inapropiada en chat
- Sistema de warnings automáticos
- Posibilidad de expulsión por admin

---

## 📈 Métricas y Analytics

### 1. KPIs de Equipos
- Tasa de formación de equipos
- Retención de miembros en equipos
- Tiempo promedio de vida de equipos
- Ejercicios completados por equipo

### 2. Engagement
- Mensajes promedio por ejercicio
- Participación en votaciones
- Tiempo activo en ejercicios colaborativos
- Frecuencia de uso de funciones de equipo

### 3. Performance
- Precisión de respuestas en modo equipo vs individual
- Tiempo de resolución colaborativa
- Distribución de contribuciones por miembro

---

## 🚀 Plan de Implementación

### Fase 1: Fundamentos (Semana 1-2)
- [ ] Crear modelos y migraciones de BD
- [ ] Implementar API básica de equipos
- [ ] Desarrollar componentes básicos de UI
- [ ] Sistema de invitaciones

### Fase 2: Colaboración (Semana 3-4)
- [ ] Integrar WebSocket para tiempo real
- [ ] Desarrollar chat de equipo
- [ ] Sistema de votación
- [ ] Ejercicios colaborativos básicos

### Fase 3: Gamificación (Semana 5-6)
- [ ] Sistema de puntuación avanzado
- [ ] Rankings de equipos
- [ ] Estadísticas detalladas
- [ ] Logros y badges de equipo

### Fase 4: Optimización (Semana 7-8)
- [ ] Testing exhaustivo
- [ ] Optimización de performance
- [ ] Moderación y seguridad
- [ ] Analytics y métricas

---

## 🎯 Casos de Uso Específicos

### Escenario 1: "Los Ciberdetectives"
Un equipo de 5 estudiantes de informática se forma para especializarse en ejercicios de ciberseguridad. Desarrollan expertise en análisis de malware y detección de fraudes digitales.

### Escenario 2: "Analistas Financieros"
Equipo de 4 profesionales del sector financiero se enfoca en ejercicios de lavado de dinero y detección de fraudes. Compiten en rankings especializados.

### Escenario 3: "Academia Policial"
Grupo de cadetes forma equipos para practicar casos reales de investigación criminal, usando la plataforma como herramienta de entrenamiento.

---

## 💡 Funcionalidades Futuras

### 1. Competencias y Torneos
- Torneos entre equipos con brackets
- Competencias temáticas mensuales
- Premios y reconocimientos

### 2. Especialización de Equipos
- Certificaciones por categorías
- Ejercicios exclusivos para equipos especializados
- Rutas de aprendizaje colaborativas

### 3. Integración con IA
- Análisis de dinámicas de equipo
- Recomendaciones de formación
- Predicción de rendimiento colaborativo

---

## 📋 Checklist de Desarrollo

### Backend
- [ ] Migración de base de datos
- [ ] Modelos de Team, TeamMember, TeamInvitation
- [ ] APIs REST para gestión de equipos
- [ ] Sistema de notificaciones
- [ ] WebSocket para colaboración
- [ ] Sistema de puntuación colaborativa

### Frontend
- [ ] Componentes de interfaz de equipos
- [ ] Integración con WebSocket
- [ ] Chat en tiempo real
- [ ] Sistema de votación
- [ ] Dashboard de estadísticas
- [ ] Gestión de invitaciones

### Testing
- [ ] Unit tests para modelos
- [ ] Integration tests para APIs
- [ ] E2E tests para flujos colaborativos
- [ ] Testing de WebSocket
- [ ] Performance testing

### Deployment
- [ ] Variables de entorno
- [ ] Configuración de WebSocket en producción
- [ ] Monitoring y logging
- [ ] Backup de datos de equipos

---

*Este documento servirá como guía para la implementación del sistema de equipos en la Academia de Detectives, fomentando la colaboración y el aprendizaje grupal en investigación criminal digital.*