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
echo -e "${BLUE}🛑 CyberDetective Academy - Script de Parada${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# Function to kill processes on specific ports
kill_port() {
    local port=$1
    local service=$2
    echo -e "${YELLOW}🔍 Cerrando procesos en puerto $port ($service)...${NC}"
    
    # Find processes using the port
    local pids=$(lsof -ti:$port 2>/dev/null)
    
    if [ ! -z "$pids" ]; then
        echo -e "${RED}❌ Cerrando procesos: $pids${NC}"
        echo "$pids" | xargs kill -9 2>/dev/null
        sleep 2
        echo -e "${GREEN}✅ Procesos cerrados en puerto $port${NC}"
    else
        echo -e "${GREEN}✅ Puerto $port ya está libre${NC}"
    fi
}

# Kill processes from PID files if they exist
if [ -f .backend.pid ]; then
    BACKEND_PID=$(cat .backend.pid)
    echo -e "${YELLOW}🔧 Deteniendo Backend (PID: $BACKEND_PID)...${NC}"
    kill $BACKEND_PID 2>/dev/null
    rm .backend.pid
    echo -e "${GREEN}✅ Backend detenido${NC}"
fi

if [ -f .frontend.pid ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    echo -e "${YELLOW}🎨 Deteniendo Frontend (PID: $FRONTEND_PID)...${NC}"
    kill $FRONTEND_PID 2>/dev/null
    rm .frontend.pid
    echo -e "${GREEN}✅ Frontend detenido${NC}"
fi

# Kill any remaining processes on our ports
kill_port $BACKEND_PORT "Backend"
kill_port $FRONTEND_PORT "Frontend"

# Kill any node/npm processes related to the project
echo -e "${YELLOW}🧹 Limpiando procesos restantes...${NC}"
pkill -f "nodemon src/index.js" 2>/dev/null
pkill -f "vite" 2>/dev/null
pkill -f "node.*cyberdetective-academy" 2>/dev/null

echo ""
echo -e "${GREEN}🏁 Todos los servicios han sido detenidos${NC}"
echo -e "${GREEN}✅ Aplicación completamente cerrada${NC}"
echo ""