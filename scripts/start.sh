#!/bin/bash
# start.sh - One command to rule them all
# Hobby Manager Setup & Start Script

set -e  # Exit on error

echo "🚀 Hobby Manager Setup v1.0.0"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Trap signals to cleanup on exit
trap cleanup EXIT INT TERM

# Check if this is a first-time setup
FIRST_TIME_SETUP=false
if [[ ! -f "data/app.db" || ! -d "apps/api/venv" || ! -d "apps/web/node_modules" ]]; then
    FIRST_TIME_SETUP=true
fi

if [[ $FIRST_TIME_SETUP == true ]]; then
    log_info "First-time setup detected. This may take a few minutes..."
else
    log_info "Existing installation detected. Starting services..."
fi

# Check system requirements
check_requirements() {
    log_info "Checking system requirements..."
    
    # Check OS
    if [[ "$OSTYPE" != "darwin"* ]]; then
        log_warning "This app is optimized for macOS. You may experience issues on other systems."
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        if command -v brew &> /dev/null; then
            log_info "Installing Node.js via Homebrew..."
            brew install node
        else
            log_error "Please install Node.js manually: https://nodejs.org"
            exit 1
        fi
    fi
    
    # Check Python 3
    if ! command -v python3 &> /dev/null; then
        log_error "Python 3 is not installed"
        if command -v brew &> /dev/null; then
            log_info "Installing Python via Homebrew..."
            brew install python@3.11
        else
            log_error "Please install Python 3 manually: https://python.org"
            exit 1
        fi
    fi
    
    # Check pip
    if ! command -v pip3 &> /dev/null && ! python3 -m pip --version &> /dev/null; then
        log_error "pip is not available. Please install Python with pip."
        exit 1
    fi
    
    log_success "All requirements met!"
}

# Setup backend
setup_backend() {
    log_info "Setting up Python backend..."
    
    cd apps/api
    
    # Create virtual environment if it doesn't exist
    if [[ ! -d "venv" ]]; then
        log_info "Creating Python virtual environment..."
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Upgrade pip
    pip install --upgrade pip --quiet
    
    # Install dependencies
    log_info "Installing Python dependencies (minimal version)..."
    pip install fastapi==0.104.1 uvicorn==0.24.0 requests==2.31.0 --quiet
    
    # Create .env from template if it doesn't exist
    if [[ ! -f ".env" ]]; then
        cp .env.example .env
        log_info "Created .env configuration file"
    fi
    
    cd ../..
    log_success "Backend setup complete!"
}

# Setup frontend
setup_frontend() {
    log_info "Setting up Next.js frontend..."
    
    cd apps/web
    
    # Install dependencies
    if [[ ! -d "node_modules" ]]; then
        log_info "Installing Node.js dependencies..."
        npm install --silent
    else
        log_info "Checking for dependency updates..."
        npm install --silent
    fi
    
    cd ../..
    log_success "Frontend setup complete!"
}

# Initialize database
init_database() {
    log_info "Initializing SQLite database..."
    
    # Run database initialization
    if [[ ! -f "data/app.db" ]]; then
        python3 scripts/init_db.py
        python3 scripts/seed_data.py
        log_success "Database initialized with sample data!"
    else
        log_info "Database already exists, skipping initialization"
    fi
}

# Start services
start_services() {
    log_info "Starting services..."
    
    # Start backend in background
    cd apps/api
    source venv/bin/activate
    log_info "Starting Python backend on http://localhost:8000"
    # Use the simple version that works reliably
    uvicorn simple_main:app --reload --port 8000 > /tmp/hobby-backend.log 2>&1 &
    BACKEND_PID=$!
    cd ../..
    
    # Wait a moment for backend to start
    sleep 3
    
    # Check if backend started successfully
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        log_error "Backend failed to start. Check logs:"
        cat /tmp/hobby-backend.log
        exit 1
    fi
    
    # Start frontend in background
    cd apps/web
    log_info "Starting Next.js frontend on http://localhost:3000"
    npm run dev > /tmp/hobby-frontend.log 2>&1 &
    FRONTEND_PID=$!
    cd ../..
    
    # Wait for frontend to start
    log_info "Waiting for services to be ready..."
    sleep 5
    
    # Check if frontend started successfully
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        log_error "Frontend failed to start. Check logs:"
        cat /tmp/hobby-frontend.log
        exit 1
    fi
    
    log_success "All services started successfully!"
    echo ""
    log_info "🌐 Frontend: http://localhost:3000"
    log_info "📱 Backend API: http://localhost:8000"
    log_info "📊 API Docs: http://localhost:8000/docs"
    echo ""
    
    # Open browser on macOS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        log_info "Opening browser..."
        sleep 2
        open http://localhost:3000
    fi
}

# Show running status
show_status() {
    echo ""
    echo "🎉 Hobby Manager is now running!"
    echo "================================"
    echo "📱 Frontend: http://localhost:3000"
    echo "🔧 Backend:  http://localhost:8000"
    echo "📚 API Docs: http://localhost:8000/docs"
    echo ""
    echo "💡 Tips:"
    echo "  • Create your first entry from the dashboard"
    echo "  • Use Cmd+K to search (when frontend supports it)"
    echo "  • Visit /admin for database management"
    echo "  • Check /settings to customize your experience"
    echo ""
    echo "Press Ctrl+C to stop all services"
    echo ""
}

# Monitor services
monitor_services() {
    while true; do
        sleep 5
        
        # Check backend
        if ! kill -0 $BACKEND_PID 2>/dev/null; then
            log_error "Backend process died unexpectedly!"
            exit 1
        fi
        
        # Check frontend
        if ! kill -0 $FRONTEND_PID 2>/dev/null; then
            log_error "Frontend process died unexpectedly!"
            exit 1
        fi
    done
}

# Main execution
main() {
    # Run setup steps
    check_requirements
    
    if [[ $FIRST_TIME_SETUP == true ]]; then
        setup_backend
        setup_frontend
        init_database
    fi
    
    # Start services
    start_services
    
    # Show status
    show_status
    
    # Monitor and wait
    monitor_services
}

# Handle command line arguments
case "${1:-}" in
    "help"|"-h"|"--help")
        echo "Hobby Manager - Personal hobby management application"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  (no args)  Setup and start the application"
        echo "  help       Show this help message"
        echo "  reset      Reset the database and start fresh"
        echo "  clean      Clean all dependencies and data"
        echo ""
        echo "The application will be available at:"
        echo "  Frontend: http://localhost:3000"
        echo "  Backend:  http://localhost:8000"
        echo ""
        exit 0
        ;;
    "reset")
        log_warning "This will delete all your data. Are you sure? (y/N)"
        read -r response
        if [[ $response =~ ^[Yy]$ ]]; then
            log_info "Resetting database..."
            rm -f data/app.db
            rm -f /tmp/hobby-*.log
            log_success "Database reset complete!"
            # Continue with normal startup
            main
        else
            log_info "Reset cancelled"
            exit 0
        fi
        ;;
    "clean")
        log_warning "This will delete all dependencies and data. Are you sure? (y/N)"
        read -r response
        if [[ $response =~ ^[Yy]$ ]]; then
            log_info "Cleaning up..."
            rm -rf apps/api/venv
            rm -rf apps/web/node_modules
            rm -rf data/
            rm -f /tmp/hobby-*.log
            log_success "Cleanup complete!"
            exit 0
        else
            log_info "Cleanup cancelled"
            exit 0
        fi
        ;;
    "")
        main
        ;;
    *)
        log_error "Unknown command: $1"
        log_info "Run '$0 help' for usage information"
        exit 1
        ;;
esac