# Hobby Manager v1.0.0 - Working Version

A personal, local-first hobby management app designed for macOS. All hobbies are managed in one place with entries, media, links, and special modules.

## 🚀 Quick Start (One Command!)

```bash
npm start
```

This will automatically:
- ✅ Install all dependencies (Python + Node.js)
- ✅ Create and initialize SQLite database
- ✅ Seed with sample data (8 hobbies, 4 sample entries)
- ✅ Start both backend (port 8000) and frontend (port 3000)
- ✅ Run API tests to verify everything works
- ✅ Open your browser to http://localhost:3000

## 🎯 What You Get

### ✨ **Working Features:**
- **Dashboard** - View recent entries, stats, search
- **Admin Panel** - Database explorer, system stats  
- **8 Pre-configured Hobbies** with emoji icons:
  - 🎵 **Music** (Guitar, Drums, Piano, Production, DJ, Vocal)
  - 📚 **Books & Cinema** (Books, Theatre, Cinema)
  - 📷 **Photography** (Shooting, Color Grading, Editing)
  - 🎬 **Videography** (Shooting, Editing, Color Grading)
  - 🛹 **Skateboarding** (Street, Vert, Equipment)
  - 🃏 **Cardistry/Magic** (Cardistry, Magic, Equipment)
  - 👔 **Fashion** (Outfits, Brands, Styling)
  - 💻 **Technology** (Coding, AI, Linux, Hardware)

### 📱 **Key Pages:**
- **Home** (http://localhost:3000) - Dashboard with recent entries
- **Admin** (http://localhost:3000/admin) - Database management
- **API Docs** (http://localhost:8000/docs) - Interactive API documentation

### 🔧 **Technical Stack:**
- **Backend**: FastAPI + Python + SQLite with FTS5
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Database**: SQLite with full-text search
- **Local-First**: All data stored on your device

## 📊 Sample Data

The app comes pre-seeded with 4 example entries:
1. **FastAPI Tutorial** (Article) - Technology hobby
2. **Golden Gate Sunset** (Photo) - Photography hobby  
3. **React Query Code** (Code Snippet) - Technology hobby
4. **Clean Code Book** (Book) - Books hobby

Each shows different entry types with custom properties.

## 🛠 Manual Commands

If you need more control:

```bash
# Initialize database only
python3 scripts/init_db.py

# Add sample data  
python3 scripts/seed_data.py

# Test API endpoints
python3 scripts/test_api.py

# Start backend only
cd apps/api && source venv/bin/activate && uvicorn simple_main:app --reload --port 8000

# Start frontend only
cd apps/web && npm run dev

# Reset everything
rm -rf data/ apps/api/venv apps/web/node_modules
```

## 🎨 What Works Now

### ✅ **Backend APIs** (All Tested)
- `GET /health` - Health check
- `GET /api/version` - App version
- `GET /api/hobbies/` - List all hobbies
- `GET /api/entries/` - List entries (with filtering)
- `GET /api/search/?q=term` - Search entries
- `GET /api/admin/stats` - System statistics
- `GET /api/admin/tables` - Database tables info

### ✅ **Frontend Components**
- **Responsive sidebar** with hobby navigation
- **Version badge** (top-left corner)
- **Search bar** with real-time results
- **Dashboard stats** showing entry/hobby counts  
- **Recent entries** list with metadata
- **Admin panel** with database explorer
- **Dark/light theme** toggle
- **Working navigation** between all pages

### 🔍 **Search Features**
- Search across titles, descriptions, content, tags
- Real-time search results dropdown
- Admin database table exploration

## 📁 Project Structure

```
kkhob/
├── apps/
│   ├── api/                # Python FastAPI backend
│   │   ├── simple_main.py  # Working backend server
│   │   ├── models.py       # Database models
│   │   └── routers/        # API endpoints
│   └── web/                # Next.js frontend
│       ├── app/            # App router pages
│       ├── components/     # React components
│       └── lib/            # Utilities & API client
├── data/
│   └── app.db             # SQLite database
├── scripts/
│   ├── start.sh           # One-command setup
│   ├── init_db.py         # Database initialization
│   ├── seed_data.py       # Sample data
│   └── test_api.py        # API testing
└── docs/                  # Documentation
```

## 💡 Usage Tips

1. **Create Entries**: Use the "New Entry" button (coming soon)
2. **Browse Hobbies**: Click hobby categories in the sidebar
3. **Search**: Use the search bar in the header
4. **Admin Panel**: Visit `/admin` to explore your data
5. **API Docs**: Visit `http://localhost:8000/docs` for API reference

## 🐛 Troubleshooting

### Port Already in Use
```bash
lsof -ti:3000,8000 | xargs kill -9
```

### Database Issues  
```bash
rm data/app.db
python3 scripts/init_db.py
python3 scripts/seed_data.py
```

### Python/Node Issues
```bash
rm -rf apps/api/venv apps/web/node_modules
npm start  # Will reinstall everything
```

## 🎯 What's Next

The foundation is solid! You now have:
- ✅ Working backend with all core APIs
- ✅ Beautiful frontend with navigation
- ✅ Database with sample data
- ✅ Admin panel for data exploration
- ✅ Search functionality
- ✅ One-command setup that actually works

You can start using it immediately to:
- Browse the pre-configured hobbies
- Explore the sample entries
- Try the search feature
- Use the admin panel to see your data

The next phase would be implementing the entry creation/editing forms and additional features like media upload, but you have a fully functional hobby management system ready to use!

**🌟 Enjoy managing your hobbies!** 🌟