#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fixed ports
BACKEND_PORT=3001
FRONTEND_PORT=5173

echo ""
echo -e "${BLUE}🚀 CyberDetective Academy - Script de Inicio${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# Function to kill processes on specific ports
kill_port() {
    local port=$1
    local service=$2
    echo -e "${YELLOW}🔍 Verificando puerto $port para $service...${NC}"
    
    # Find processes using the port
    local pids=$(lsof -ti:$port 2>/dev/null)
    
    if [ ! -z "$pids" ]; then
        echo -e "${RED}❌ Puerto $port ocupado. Cerrando procesos...${NC}"
        echo "$pids" | xargs kill -9 2>/dev/null
        sleep 2
        echo -e "${GREEN}✅ Procesos cerrados en puerto $port${NC}"
    else
        echo -e "${GREEN}✅ Puerto $port disponible${NC}"
    fi
}

# Function to check if PostgreSQL is running
check_postgres() {
    echo -e "${YELLOW}🔍 Verificando PostgreSQL...${NC}"
    if brew services list | grep postgresql | grep started >/dev/null; then
        echo -e "${GREEN}✅ PostgreSQL está ejecutándose${NC}"
    else
        echo -e "${RED}❌ PostgreSQL no está ejecutándose. Iniciando...${NC}"
        brew services start postgresql@14
        sleep 3
        echo -e "${GREEN}✅ PostgreSQL iniciado${NC}"
    fi
}

# Function to check database
check_database() {
    echo -e "${YELLOW}🔍 Verificando base de datos...${NC}"
    if psql -U postgres -lqt | cut -d \| -f 1 | grep -qw cyberdetective_db; then
        echo -e "${GREEN}✅ Base de datos cyberdetective_db existe${NC}"
    else
        echo -e "${RED}❌ Base de datos no encontrada. Creándola...${NC}"
        psql -U postgres <<EOF
CREATE USER cyberdetective WITH ENCRYPTED PASSWORD 'cyberdetective123';
CREATE DATABASE cyberdetective_db OWNER cyberdetective;
GRANT ALL PRIVILEGES ON DATABASE cyberdetective_db TO cyberdetective;
EOF
        echo -e "${GREEN}✅ Base de datos creada${NC}"
        
        # Initialize database
        echo -e "${YELLOW}📊 Inicializando base de datos...${NC}"
        cd backend
        node src/db/init-db.js
        cd ..
        echo -e "${GREEN}✅ Base de datos inicializada${NC}"
    fi
}

# Function to check if migration is needed
check_migration() {
    echo -e "${YELLOW}🔍 Verificando estructura de base de datos...${NC}"
    if psql -U cyberdetective -d cyberdetective_db -c "\d exercises" | grep -q "difficulty"; then
        echo -e "${GREEN}✅ Base de datos ya migrada (usando difficulty)${NC}"
    else
        echo -e "${YELLOW}⚠️  Aplicando migración de level → difficulty...${NC}"
        psql -U cyberdetective -d cyberdetective_db -f backend/src/db/migrate-to-difficulty.sql
        echo -e "${GREEN}✅ Migración aplicada${NC}"
    fi
}

# Function to verify dependencies
check_dependencies() {
    echo -e "${YELLOW}🔍 Verificando dependencias...${NC}"
    
    # Check backend dependencies
    if [ ! -d "backend/node_modules" ]; then
        echo -e "${RED}❌ Dependencias del backend no encontradas. Instalando...${NC}"
        cd backend && npm install && cd ..
    else
        echo -e "${GREEN}✅ Dependencias del backend OK${NC}"
    fi
    
    # Check frontend dependencies
    if [ ! -d "frontend/node_modules" ]; then
        echo -e "${RED}❌ Dependencias del frontend no encontradas. Instalando...${NC}"
        cd frontend && npm install && cd ..
    else
        echo -e "${GREEN}✅ Dependencias del frontend OK${NC}"
    fi
}

# Main execution
echo -e "${BLUE}🔧 Preparando entorno...${NC}"

# Kill any existing processes on our ports
kill_port $BACKEND_PORT "Backend"
kill_port $FRONTEND_PORT "Frontend"

# Check system requirements
check_postgres
check_database
check_migration
check_dependencies

echo ""
echo -e "${BLUE}🚀 Iniciando servicios...${NC}"

# Start Backend with fixed port
echo -e "${YELLOW}🔧 Iniciando Backend en puerto $BACKEND_PORT...${NC}"
cd backend
PORT=$BACKEND_PORT npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo -e "${YELLOW}⏳ Esperando a que el backend inicie...${NC}"
sleep 5

# Test backend
if curl -s http://localhost:$BACKEND_PORT/api/exercises >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend respondiendo en puerto $BACKEND_PORT${NC}"
else
    echo -e "${RED}❌ Backend no responde. Revisando logs...${NC}"
    tail -10 backend.log
    echo -e "${RED}❌ Error: Backend no se pudo iniciar${NC}"
    exit 1
fi

# Start Frontend with fixed port
echo -e "${YELLOW}🎨 Iniciando Frontend en puerto $FRONTEND_PORT...${NC}"
cd frontend
PORT=$FRONTEND_PORT npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
echo -e "${YELLOW}⏳ Esperando a que el frontend inicie...${NC}"
sleep 5

# Test frontend
if curl -s http://localhost:$FRONTEND_PORT >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend respondiendo en puerto $FRONTEND_PORT${NC}"
else
    echo -e "${RED}❌ Frontend no responde. Revisando logs...${NC}"
    tail -10 frontend.log
    echo -e "${RED}❌ Error: Frontend no se pudo iniciar${NC}"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Final status
echo ""
echo -e "${GREEN}🎉 ¡Aplicación iniciada exitosamente!${NC}"
echo ""
echo -e "${BLUE}📍 URLs de acceso:${NC}"
echo -e "   🔧 Backend:  ${GREEN}http://localhost:$BACKEND_PORT${NC}"
echo -e "   🎨 Frontend: ${GREEN}http://localhost:$FRONTEND_PORT${NC}"
echo ""
echo -e "${BLUE}📊 Estado de servicios:${NC}"
psql -U cyberdetective -d cyberdetective_db -c "SELECT COUNT(*) as ejercicios FROM exercises;" 2>/dev/null | grep -E '^[[:space:]]*[0-9]+[[:space:]]*$' | xargs echo -e "   📚 Ejercicios cargados: ${GREEN}"
echo -e "${NC}"
echo -e "${YELLOW}📝 Logs:${NC}"
echo -e "   Backend:  tail -f backend.log"
echo -e "   Frontend: tail -f frontend.log"
echo ""
echo -e "${RED}🛑 Para detener: Presiona Ctrl+C${NC}"
echo ""

# Open browser automatically
sleep 2
echo -e "${BLUE}🌐 Abriendo navegador...${NC}"
open http://localhost:$FRONTEND_PORT

# Save PIDs for cleanup
echo $BACKEND_PID > .backend.pid
echo $FRONTEND_PID > .frontend.pid

# Handle Ctrl+C gracefully
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Deteniendo servicios...${NC}"
    
    if [ -f .backend.pid ]; then
        BACKEND_PID=$(cat .backend.pid)
        kill $BACKEND_PID 2>/dev/null
        rm .backend.pid
        echo -e "${GREEN}✅ Backend detenido${NC}"
    fi
    
    if [ -f .frontend.pid ]; then
        FRONTEND_PID=$(cat .frontend.pid)
        kill $FRONTEND_PID 2>/dev/null
        rm .frontend.pid
        echo -e "${GREEN}✅ Frontend detenido${NC}"
    fi
    
    # Additional cleanup - kill any remaining processes on our ports
    kill_port $BACKEND_PORT "Backend (limpieza)"
    kill_port $FRONTEND_PORT "Frontend (limpieza)"
    
    echo -e "${GREEN}🏁 Aplicación detenida completamente${NC}"
    exit 0
}

trap cleanup INT TERM

# Keep script running and show live status
while true; do
    sleep 30
    # Check if services are still running
    if ! curl -s http://localhost:$BACKEND_PORT/api/exercises >/dev/null 2>&1; then
        echo -e "${RED}❌ Backend se detuvo inesperadamente${NC}"
        cleanup
    fi
    
    if ! curl -s http://localhost:$FRONTEND_PORT >/dev/null 2>&1; then
        echo -e "${RED}❌ Frontend se detuvo inesperadamente${NC}"
        cleanup
    fi
done