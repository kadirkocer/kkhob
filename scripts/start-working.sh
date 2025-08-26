#!/bin/bash
# start-working.sh - Simple working version of the start script

set -e

echo "🚀 Hobby Manager Setup v1.0.0 (Working Version)"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Cleanup function
cleanup() {
    if [[ -n $BACKEND_PID ]]; then
        log_info "Stopping backend (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [[ -n $FRONTEND_PID ]]; then
        log_info "Stopping frontend (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    log_info "Cleanup complete. Goodbye! 👋"
}

trap cleanup EXIT INT TERM

# Check if setup is needed
NEED_SETUP=false
if [[ ! -f "data/app.db" ]]; then
    NEED_SETUP=true
    log_info "Database not found. Will initialize..."
fi

if [[ ! -d "apps/api/venv" ]]; then
    NEED_SETUP=true
    log_info "Python virtual environment not found. Will create..."
fi

if [[ ! -d "apps/web/node_modules" ]]; then
    NEED_SETUP=true
    log_info "Node modules not found. Will install..."
fi

# Setup if needed
if [[ $NEED_SETUP == true ]]; then
    log_info "Running setup..."
    
    # Setup Python backend
    if [[ ! -d "apps/api/venv" ]]; then
        log_info "Creating Python virtual environment..."
        cd apps/api
        python3 -m venv venv
        source venv/bin/activate
        pip install --upgrade pip --quiet
        
        # Try our working requirements
        log_info "Installing Python dependencies..."
        pip install fastapi==0.104.1 uvicorn==0.24.0 requests==2.31.0 --quiet
        
        cd ../..
        log_success "Python backend setup complete!"
    fi
    
    # Setup Node frontend
    if [[ ! -d "apps/web/node_modules" ]]; then
        log_info "Installing Node.js dependencies..."
        cd apps/web
        npm install --silent
        cd ../..
        log_success "Frontend setup complete!"
    fi
    
    # Initialize database
    if [[ ! -f "data/app.db" ]]; then
        log_info "Initializing database..."
        python3 scripts/init_db.py
        python3 scripts/seed_data.py
        log_success "Database initialized!"
    fi
fi

# Start services
log_info "Starting services..."

# Start backend
cd apps/api
source venv/bin/activate
log_info "Starting Python backend on http://localhost:8000"
uvicorn simple_main:app --reload --port 8000 > /tmp/hobby-backend.log 2>&1 &
BACKEND_PID=$!
cd ../..

# Wait for backend
sleep 3

# Check if backend is running
if ! curl -s http://localhost:8000/health > /dev/null; then
    log_error "Backend failed to start"
    cat /tmp/hobby-backend.log
    exit 1
fi

# Start frontend
cd apps/web
log_info "Starting Next.js frontend on http://localhost:3000"
npm run dev > /tmp/hobby-frontend.log 2>&1 &
FRONTEND_PID=$!
cd ../..

# Wait for frontend
sleep 5

log_success "All services started successfully!"
echo ""
log_info "🌐 Frontend: http://localhost:3000"
log_info "📱 Backend API: http://localhost:8000"
log_info "📊 API Docs: http://localhost:8000/docs"
echo ""

# Test API
log_info "Running API tests..."
python3 scripts/test_api.py

echo ""
echo "🎉 Hobby Manager is now running!"
echo "================================"
echo ""
echo "💡 Tips:"
echo "  • Visit http://localhost:3000 to use the app"
echo "  • Visit http://localhost:3000/admin for admin panel"
echo "  • API docs are at http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Open browser on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    log_info "Opening browser..."
    sleep 2
    open http://localhost:3000
fi

# Monitor services
while true; do
    sleep 10
    
    # Check backend
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        log_error "Backend process died!"
        exit 1
    fi
    
    # Check frontend
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        log_error "Frontend process died!"
        exit 1
    fi
done