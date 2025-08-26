from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, func, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    settings_json = Column(Text, default="{}")
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class Hobby(Base):
    __tablename__ = "hobbies"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    parent_id = Column(Integer, ForeignKey("hobbies.id", ondelete="CASCADE"))
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False)
    icon = Column(String(100))
    color = Column(String(7), default="#40E0D0")
    config_json = Column(Text, default="{}")
    position = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    parent = relationship("Hobby", remote_side=[id])
    children = relationship("Hobby", back_populates="parent")
    entries = relationship("Entry", back_populates="hobby")
    shelves = relationship("Shelf", back_populates="hobby")

class HobbyType(Base):
    __tablename__ = "hobby_types"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    key = Column(String(50), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    schema_json = Column(Text, nullable=False)
    ui_config_json = Column(Text, default="{}")
    version = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())

class Entry(Base):
    __tablename__ = "entries"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    hobby_id = Column(Integer, ForeignKey("hobbies.id", ondelete="CASCADE"))
    type_key = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    content_markdown = Column(Text)
    tags = Column(Text)  # Denormalized for FTS
    is_favorite = Column(Boolean, default=False)
    is_archived = Column(Boolean, default=False)
    view_count = Column(Integer, default=0)
    last_viewed_at = Column(DateTime)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    hobby = relationship("Hobby", back_populates="entries")
    props = relationship("EntryProp", back_populates="entry", cascade="all, delete-orphan")
    media = relationship("EntryMedia", back_populates="entry", cascade="all, delete-orphan")
    entry_tags = relationship("EntryTag", back_populates="entry", cascade="all, delete-orphan")

class EntryProp(Base):
    __tablename__ = "entry_props"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    entry_id = Column(Integer, ForeignKey("entries.id", ondelete="CASCADE"))
    key = Column(String(100), nullable=False)
    value_json = Column(Text, nullable=False)
    
    # Relationships
    entry = relationship("Entry", back_populates="props")

class EntryMedia(Base):
    __tablename__ = "entry_media"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    entry_id = Column(Integer, ForeignKey("entries.id", ondelete="CASCADE"))
    type = Column(String(20), nullable=False)  # 'image', 'video', 'audio', 'file'
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255))
    mime_type = Column(String(100))
    size_bytes = Column(Integer)
    width = Column(Integer)
    height = Column(Integer)
    duration_seconds = Column(Integer)  # For videos/audio
    metadata_json = Column(Text)  # EXIF, etc.
    thumbnail_path = Column(String(255))
    position = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    entry = relationship("Entry", back_populates="media")

class Tag(Base):
    __tablename__ = "tags"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    color = Column(String(7))
    usage_count = Column(Integer, default=0)
    
    # Relationships
    entry_tags = relationship("EntryTag", back_populates="tag")

class EntryTag(Base):
    __tablename__ = "entry_tags"
    
    entry_id = Column(Integer, ForeignKey("entries.id", ondelete="CASCADE"), primary_key=True)
    tag_id = Column(Integer, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True)
    
    # Relationships
    entry = relationship("Entry", back_populates="entry_tags")
    tag = relationship("Tag", back_populates="entry_tags")

class Shelf(Base):
    __tablename__ = "shelves"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    hobby_id = Column(Integer, ForeignKey("hobbies.id", ondelete="CASCADE"))
    name = Column(String(255), nullable=False)
    description = Column(Text)
    type = Column(String(50), default="general")  # 'books', 'movies', 'music', 'general'
    view_mode = Column(String(20), default="grid")  # 'grid', 'list', 'compact'
    sort_by = Column(String(50), default="created_at")
    sort_order = Column(String(10), default="DESC")
    config_json = Column(Text, default="{}")
    position = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    hobby = relationship("Hobby", back_populates="shelves")
    items = relationship("ShelfItem", back_populates="shelf", cascade="all, delete-orphan")

class ShelfItem(Base):
    __tablename__ = "shelf_items"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    shelf_id = Column(Integer, ForeignKey("shelves.id", ondelete="CASCADE"))
    entry_id = Column(Integer, ForeignKey("entries.id", ondelete="CASCADE"))
    external_url = Column(Text)
    title = Column(String(255))
    subtitle = Column(String(255))
    cover_url = Column(Text)
    metadata_json = Column(Text)
    position = Column(Integer, default=0)
    added_at = Column(DateTime, default=func.now())
    
    # Relationships
    shelf = relationship("Shelf", back_populates="items")
    entry = relationship("Entry")

class ActivityLog(Base):
    __tablename__ = "activity_logs"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    action = Column(String(50), nullable=False)  # 'create', 'update', 'delete', 'view'
    entity_type = Column(String(50), nullable=False)  # 'entry', 'hobby', 'shelf'
    entity_id = Column(Integer)
    details_json = Column(Text)
    ip_address = Column(String(45))
    user_agent = Column(Text)
    created_at = Column(DateTime, default=func.now())

class AppSetting(Base):
    __tablename__ = "app_settings"
    
    key = Column(String(100), primary_key=True)
    value = Column(Text, nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

# Create indexes
Index("idx_hobbies_parent", Hobby.parent_id)
Index("idx_hobbies_slug", Hobby.slug)
Index("idx_entries_hobby", Entry.hobby_id)
Index("idx_entries_type", Entry.type_key)
Index("idx_entries_favorite", Entry.is_favorite)
Index("idx_entries_archived", Entry.is_archived)
Index("idx_entries_created", Entry.created_at.desc())
Index("idx_entries_created_hobby", Entry.hobby_id, Entry.created_at.desc())
Index("idx_entry_props_entry", EntryProp.entry_id)
Index("idx_entry_props_key", EntryProp.key)
Index("idx_entry_media_entry", EntryMedia.entry_id)
Index("idx_media_entry_type", EntryMedia.entry_id, EntryMedia.type)
Index("idx_tags_slug", Tag.slug)
Index("idx_tags_usage", Tag.usage_count.desc())
Index("idx_shelves_hobby", Shelf.hobby_id)
Index("idx_shelf_items_shelf", ShelfItem.shelf_id)
Index("idx_activity_logs_entity", ActivityLog.entity_type, ActivityLog.entity_id)
Index("idx_activity_date", ActivityLog.created_at.desc())