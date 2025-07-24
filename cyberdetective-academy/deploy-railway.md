# 🚀 Deploy CyberDetective Academy en Railway

## Estado Actual
✅ **Tu proyecto ya está configurado para Railway!**

Ya tienes:
- `railway.json` configurado para backend y frontend
- Scripts npm correctos en package.json
- Configuración Vite optimizada para preview

## Método Rápido: GitHub Deploy

### Paso 1: Ve a Railway
1. Ve a https://railway.app
2. Haz clic en "New Project"
3. Selecciona "Deploy from GitHub repo"
4. Busca y conecta tu repositorio

### Paso 2: Railway detectará automáticamente
Railway encontrará tus `railway.json` y configurará:

**Backend Service:**
- Root Directory: `/backend`
- Build: `npm install`
- Start: `npm start`
- Port: 3001 (auto-detectado)

**Frontend Service:**
- Root Directory: `/frontend`
- Build: `npm install && npm run build`
- Start: `npm run preview`
- Port: 4173 (auto-detectado)

### Paso 3: Agregar PostgreSQL
1. En Railway dashboard, click "+ New"
2. Select "Database" → "Add PostgreSQL"
3. Railway genera automáticamente DATABASE_URL

### Paso 4: Variables de Entorno

**Backend Environment Variables:**
```env
NODE_ENV=production
JWT_SECRET=cyberdetective_super_secret_key_2024
JWT_EXPIRE=7d
DATABASE_URL=(auto-generada por Railway)
CLIENT_URL=(URL del frontend de Railway)
```

**Frontend Environment Variables:**
```env
VITE_API_URL=(URL del backend de Railway)/api
```

### Paso 5: Inicializar Base de Datos

Desde Railway PostgreSQL Console, ejecutar en orden:

```sql
-- 1. Esquema principal
\i backend/src/db/schema.sql

-- 2. Esquema de equipos
\i backend/src/db/teams-schema.sql

-- 3. Tablas admin
\i backend/src/db/create-admin-tables.sql

-- 4. Usuario admin
\i backend/src/db/create-admin-user.sql

-- 5. Datos iniciales
\i backend/src/db/seed.sql
```

## ✅ Checklist de Deploy

- [ ] Conectar repo a Railway
- [ ] Backend service deployado
- [ ] Frontend service deployado
- [ ] PostgreSQL database agregada
- [ ] Variables de entorno configuradas
- [ ] Base de datos inicializada
- [ ] Probar aplicación en URLs de Railway

## 🔧 URLs Finales

Después del deploy obtendrás:
- Backend: `https://tu-backend-xyz.railway.app`
- Frontend: `https://tu-frontend-xyz.railway.app`
- Database: Connection string automática

## 📝 Notas Importantes

1. **CORS está configurado** para usar CLIENT_URL automáticamente
2. **Socket.io** está configurado para producción
3. **Health checks** incluidos en railway.json
4. **Preview mode** optimizado para Railway hosting

## 🚨 Si hay problemas

1. **Build fails**: Verificar que todas las dependencias estén en package.json
2. **Database connection**: Verificar que DATABASE_URL esté configurada
3. **CORS errors**: Verificar que CLIENT_URL apunte al frontend correcto
4. **Socket.io**: Verificar que ambos servicios usen las URLs correctas

¡Tu proyecto está listo para deploy! 🎉