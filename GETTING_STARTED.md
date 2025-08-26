# Getting Started with Hobby Manager

Welcome to your personal hobby management application! This guide will get you up and running in under 5 minutes.

## 🚀 One-Command Setup

The easiest way to get started:

```bash
npm start
```

That's it! The setup script will:
- ✅ Check system requirements
- ✅ Install Python and Node.js dependencies
- ✅ Initialize the SQLite database
- ✅ Seed with sample data
- ✅ Start both backend and frontend
- ✅ Open your browser automatically

## 🌐 Application URLs

Once running, you'll have access to:

- **Frontend**: http://localhost:3000 (Main application)
- **Backend API**: http://localhost:8000 (REST API)
- **API Documentation**: http://localhost:8000/docs (Interactive docs)

## 📱 Key Features

### Dashboard (/)
- View recent entries across all hobbies
- Quick stats and system overview
- Search bar with real-time results
- Quick action buttons

### Admin Panel (/admin)
- System statistics
- Database explorer
- Table structure viewer
- Query interface (coming soon)

### Hobbies
Pre-configured hobby categories:
- 🎵 **Music** - Guitar, Drums, Piano, Production, DJ, Vocal
- 📚 **Books & Performing Arts & Cinema** - Books, Theatre, Cinema
- 📷 **Photography** - Shooting, Color Grading, Photo Editing
- 🎬 **Videography** - Shooting, Editing, Color Grading
- 🛹 **Skateboarding** - Street, Vert, Equipment
- 🃏 **Cardistry/Magic** - Cardistry, Magic Tricks, Equipment
- 👔 **Fashion** - Outfits, Brands, Styling
- 💻 **Technology** - Coding, AI, Linux, Hardware

### Entry Types
Dynamic entry types with JSON schema validation:
- 📄 **Article** - URL, author, publication, reading time
- 📷 **Photo** - Camera settings, lens, location, preset
- 💻 **Code Snippet** - Language, framework, dependencies
- 🎬 **Video** - Duration, resolution, FPS, equipment
- 📚 **Book** - Author, ISBN, pages, rating, status
- 📝 **General Note** - Category, priority, status

## 🛠 Manual Commands

If you prefer manual control:

```bash
# Initialize database
python3 scripts/init_db.py

# Seed sample data
python3 scripts/seed_data.py

# Start backend only
cd apps/api && uvicorn main:app --reload --port 8000

# Start frontend only
cd apps/web && npm run dev

# Test API
python3 scripts/test_api.py

# Reset everything
./scripts/start.sh reset

# Clean all data and dependencies
./scripts/start.sh clean
```

## 📊 Database

- **Engine**: SQLite with WAL mode for better performance
- **Location**: `data/app.db`
- **Search**: Full-text search with FTS5
- **Backup**: Simple file copy of `data/app.db`

## 🎯 First Steps

1. **Create your first entry**: Use the "New Entry" button on the dashboard
2. **Explore hobbies**: Click on hobby categories in the sidebar
3. **Try search**: Use Cmd+K or the search bar to find content
4. **Check admin panel**: Visit `/admin` to explore your data
5. **Customize**: Add your own hobbies and entry types

## 🔧 Configuration

### Backend (.env)
Located at `apps/api/.env`:
- Database path
- Upload limits
- CORS settings
- Debug mode

### Frontend (.env.local)
Located at `apps/web/.env.local`:
- API URL
- Theme settings

## 📝 Usage Tips

- **Tags**: Use comma-separated tags for better organization
- **Search**: Searches across titles, descriptions, content, and tags
- **Favorites**: Star important entries for quick access
- **Archive**: Hide completed or old entries without deleting
- **Media**: Upload images and files (auto-optimized)
- **Admin**: Use the admin panel to explore data structure

## 🆘 Troubleshooting

### Port Already in Use
```bash
# Kill processes on ports 3000/8000
lsof -ti:3000,8000 | xargs kill -9
```

### Database Issues
```bash
# Reset database
./scripts/start.sh reset
```

### Dependency Issues
```bash
# Clean and reinstall
./scripts/start.sh clean
npm start
```

### Still Having Issues?
1. Check the logs in `/tmp/hobby-*.log`
2. Make sure you have Python 3.11+ and Node.js 18+
3. Try running commands manually (see Manual Commands above)
4. Reset everything with `./scripts/start.sh reset`

## 🎉 You're Ready!

Your personal hobby management system is now running. Start by creating your first entry and exploring the different hobby categories. The system grows with you - add new hobbies, customize entry types, and build your personal knowledge base!

Happy hobby managing! 🌟