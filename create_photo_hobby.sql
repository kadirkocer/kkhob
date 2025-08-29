-- Create Photography hobby
INSERT INTO hobbies (name, slug, icon, color, parent_id, position, is_active) 
VALUES ('Photography', 'photography', '📸', '#8B5CF6', NULL, 1, 1);

-- Also create a Videography hobby
INSERT INTO hobbies (name, slug, icon, color, parent_id, position, is_active) 
VALUES ('Videography', 'videography', '🎥', '#EF4444', NULL, 2, 1);

-- Show all hobbies
SELECT id, name, slug, icon, color FROM hobbies WHERE is_active = 1;