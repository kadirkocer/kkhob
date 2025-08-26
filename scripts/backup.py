#!/usr/bin/env python3
"""
Backup and Restore Script for Hobby Manager
Supports JSON export/import with full data integrity
"""

import json
import sqlite3
import sys
import os
import shutil
from pathlib import Path
from datetime import datetime
import argparse
import zipfile

# Database path
DB_PATH = Path(__file__).parent.parent / "data" / "app.db"
BACKUP_DIR = Path(__file__).parent.parent / "backups"

def ensure_backup_dir():
    """Ensure backup directory exists"""
    BACKUP_DIR.mkdir(exist_ok=True)

def export_data(output_file=None):
    """Export all data to JSON format"""
    ensure_backup_dir()
    
    if not output_file:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = BACKUP_DIR / f"hobby_manager_backup_{timestamp}.json"
    
    try:
        conn = sqlite3.connect(str(DB_PATH))
        conn.row_factory = sqlite3.Row  # Enable column access by name
        
        data = {
            "metadata": {
                "export_date": datetime.now().isoformat(),
                "version": "1.2.0",
                "database_path": str(DB_PATH)
            },
            "tables": {}
        }
        
        # Get all table names
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
        tables = [row[0] for row in cursor.fetchall()]
        
        # Export each table
        for table in tables:
            cursor.execute(f"SELECT * FROM {table}")
            rows = cursor.fetchall()
            data["tables"][table] = [dict(row) for row in rows]
            print(f"✓ Exported {len(rows)} rows from {table}")
        
        # Write to JSON file
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False, default=str)
        
        # Create compressed version
        zip_file = output_file.with_suffix('.zip')
        with zipfile.ZipFile(zip_file, 'w', zipfile.ZIP_DEFLATED) as zf:
            zf.write(output_file, output_file.name)
        
        print(f"\n✅ Export completed successfully!")
        print(f"📁 JSON backup: {output_file}")
        print(f"📦 Compressed backup: {zip_file}")
        print(f"📊 Total tables exported: {len(tables)}")
        
        # Show summary
        total_rows = sum(len(data["tables"][table]) for table in data["tables"])
        print(f"📈 Total rows exported: {total_rows}")
        
        return str(output_file)
        
    except Exception as e:
        print(f"❌ Export failed: {str(e)}")
        return None
    finally:
        if 'conn' in locals():
            conn.close()

def import_data(input_file):
    """Import data from JSON backup"""
    
    if not os.path.exists(input_file):
        print(f"❌ Backup file not found: {input_file}")
        return False
    
    # Handle zip files
    if input_file.endswith('.zip'):
        temp_dir = Path("/tmp/hobby_manager_restore")
        temp_dir.mkdir(exist_ok=True)
        
        with zipfile.ZipFile(input_file, 'r') as zf:
            zf.extractall(temp_dir)
            # Find the JSON file in the extracted contents
            json_files = list(temp_dir.glob("*.json"))
            if not json_files:
                print("❌ No JSON file found in the zip archive")
                return False
            input_file = str(json_files[0])
    
    try:
        # Load backup data
        with open(input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        print(f"📄 Loading backup from: {input_file}")
        print(f"📅 Backup date: {data['metadata'].get('export_date', 'Unknown')}")
        print(f"🏷️  Backup version: {data['metadata'].get('version', 'Unknown')}")
        
        # Backup current database
        if DB_PATH.exists():
            backup_current = DB_PATH.with_suffix(f".backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.db")
            shutil.copy2(DB_PATH, backup_current)
            print(f"💾 Current database backed up to: {backup_current}")
        
        # Connect to database
        conn = sqlite3.connect(str(DB_PATH))
        cursor = conn.cursor()
        
        # Disable foreign key constraints during import
        cursor.execute("PRAGMA foreign_keys = OFF")
        
        # Clear existing data (in correct order to avoid foreign key issues)
        table_order = ['entries', 'hobbies', 'app_settings', 'user_preferences']
        for table in table_order:
            if table in data["tables"]:
                cursor.execute(f"DELETE FROM {table}")
                print(f"🗑️  Cleared existing data from {table}")
        
        # Import data
        imported_tables = 0
        imported_rows = 0
        
        for table_name, rows in data["tables"].items():
            if not rows:
                continue
                
            # Get column names from first row
            columns = list(rows[0].keys())
            placeholders = ', '.join(['?' for _ in columns])
            column_names = ', '.join(columns)
            
            # Insert data
            insert_sql = f"INSERT INTO {table_name} ({column_names}) VALUES ({placeholders})"
            
            for row in rows:
                values = [row[col] for col in columns]
                cursor.execute(insert_sql, values)
            
            imported_tables += 1
            imported_rows += len(rows)
            print(f"✓ Imported {len(rows)} rows into {table_name}")
        
        # Re-enable foreign key constraints
        cursor.execute("PRAGMA foreign_keys = ON")
        
        # Commit changes
        conn.commit()
        
        print(f"\n✅ Import completed successfully!")
        print(f"📊 Tables imported: {imported_tables}")
        print(f"📈 Total rows imported: {imported_rows}")
        
        return True
        
    except Exception as e:
        print(f"❌ Import failed: {str(e)}")
        if 'conn' in locals():
            conn.rollback()
        return False
    finally:
        if 'conn' in locals():
            conn.close()

def list_backups():
    """List available backup files"""
    ensure_backup_dir()
    
    backups = list(BACKUP_DIR.glob("*.json")) + list(BACKUP_DIR.glob("*.zip"))
    
    if not backups:
        print("📂 No backup files found")
        return
    
    print(f"📂 Available backups in {BACKUP_DIR}:")
    print("-" * 60)
    
    for backup in sorted(backups, key=lambda x: x.stat().st_mtime, reverse=True):
        size = backup.stat().st_size
        size_mb = size / (1024 * 1024)
        mtime = datetime.fromtimestamp(backup.stat().st_mtime)
        
        print(f"📄 {backup.name}")
        print(f"   Size: {size_mb:.2f} MB | Modified: {mtime.strftime('%Y-%m-%d %H:%M:%S')}")
        print()

def main():
    parser = argparse.ArgumentParser(description="Hobby Manager Backup & Restore Tool")
    subparsers = parser.add_subparsers(dest='command', help='Available commands')
    
    # Export command
    export_parser = subparsers.add_parser('export', help='Export database to JSON backup')
    export_parser.add_argument('-o', '--output', help='Output file path')
    
    # Import command
    import_parser = subparsers.add_parser('import', help='Import data from JSON backup')
    import_parser.add_argument('file', help='Backup file path')
    import_parser.add_argument('-y', '--yes', action='store_true', help='Skip confirmation prompt')
    
    # List command
    list_parser = subparsers.add_parser('list', help='List available backup files')
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    print("🗄️  Hobby Manager Backup Tool v1.1.0")
    print("=" * 50)
    
    if args.command == 'export':
        output_file = args.output
        if output_file:
            output_file = Path(output_file)
        export_data(output_file)
    
    elif args.command == 'import':
        if not args.yes:
            print("⚠️  WARNING: This will replace all existing data!")
            response = input("Are you sure you want to continue? (y/N): ")
            if response.lower() != 'y':
                print("❌ Import cancelled")
                return
        
        import_data(args.file)
    
    elif args.command == 'list':
        list_backups()

if __name__ == '__main__':
    main()