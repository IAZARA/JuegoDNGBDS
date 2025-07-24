#!/bin/bash

echo "🚀 Deploy CyberDetective Academy con Railway CLI"
echo "============================================="

# 1. Crear proyecto (necesita interacción manual)
echo "1. Creando proyecto Railway..."
echo "Ejecuta: railway init"
echo "Selecciona: Create new project -> Empty project -> cyberdetective-academy"
echo ""
read -p "Presiona ENTER cuando hayas creado el proyecto..."

# 2. Agregar PostgreSQL
echo "2. Agregando PostgreSQL..."
railway add postgresql
echo "✅ PostgreSQL agregada"

# 3. Deploy backend
echo "3. Deployando backend..."
cd backend
railway up --detach
echo "✅ Backend deployado"

# 4. Deploy frontend  
echo "4. Deployando frontend..."
cd ../frontend
railway service new frontend
railway up --detach
echo "✅ Frontend deployado"

# 5. Ver status
echo "5. Estado del proyecto:"
cd ..
railway status

echo ""
echo "🎉 Deploy completado!"
echo "Ahora configura las variables de entorno desde el dashboard:"
echo "1. Ve a railway.app"
echo "2. Selecciona tu proyecto"
echo "3. Configura las variables según deploy-railway.md"