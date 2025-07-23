#!/bin/bash

echo "🚀 Iniciando CyberDetective Academy..."
echo ""

# Verificar PostgreSQL
echo "📊 Verificando PostgreSQL..."
if ! psql -U postgres -lqt | cut -d \| -f 1 | grep -qw cyberdetective_db; then
    echo "❌ Base de datos no encontrada. Creándola..."
    psql -U postgres <<EOF
CREATE USER cyberdetective WITH ENCRYPTED PASSWORD 'cyberdetective123';
CREATE DATABASE cyberdetective_db OWNER cyberdetective;
GRANT ALL PRIVILEGES ON DATABASE cyberdetective_db TO cyberdetective;
EOF
    echo "✅ Base de datos creada"
    
    # Inicializar base de datos
    cd backend
    node src/db/init-db.js
    cd ..
fi

# Iniciar Backend
echo ""
echo "🔧 Iniciando Backend en puerto 3001..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Esperar a que el backend inicie
sleep 3

# Iniciar Frontend
echo ""
echo "🎨 Iniciando Frontend en puerto 5173..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Aplicación iniciada!"
echo ""
echo "📌 Backend: http://localhost:3001"
echo "📌 Frontend: http://localhost:5173"
echo ""
echo "🛑 Para detener: Presiona Ctrl+C"
echo ""

# Esperar y manejar Ctrl+C
trap "echo ''; echo '🛑 Deteniendo servidores...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT

# Mantener el script corriendo
wait