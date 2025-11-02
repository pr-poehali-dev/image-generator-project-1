-- Create players table for storing coins and purchased skins
CREATE TABLE IF NOT EXISTS snake_players (
    player_id VARCHAR(255) PRIMARY KEY,
    coins INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    games_played INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create skins table
CREATE TABLE IF NOT EXISTS snake_skins (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    head_color VARCHAR(7) NOT NULL,
    body_color VARCHAR(7) NOT NULL,
    emoji VARCHAR(10),
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create purchased skins table
CREATE TABLE IF NOT EXISTS snake_player_skins (
    player_id VARCHAR(255) NOT NULL,
    skin_id INTEGER NOT NULL,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (player_id, skin_id),
    FOREIGN KEY (skin_id) REFERENCES snake_skins(id)
);

-- Create active skin table
CREATE TABLE IF NOT EXISTS snake_active_skins (
    player_id VARCHAR(255) PRIMARY KEY,
    skin_id INTEGER NOT NULL,
    activated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (skin_id) REFERENCES snake_skins(id)
);

-- Insert default skins
INSERT INTO snake_skins (name, description, price, head_color, body_color, emoji, is_premium) VALUES
('Классика', 'Стандартный зелёный скин', 0, '#10B981', '#059669', '🐍', FALSE),
('Огненная', 'Жаркая красно-оранжевая змейка', 100, '#F97316', '#EA580C', '🔥', FALSE),
('Ледяная', 'Холодная сине-голубая змейка', 150, '#0EA5E9', '#0284C7', '❄️', FALSE),
('Королевская', 'Фиолетовая королевская змея', 200, '#A855F7', '#9333EA', '👑', FALSE),
('Золотая', 'Блестящая золотая змейка', 300, '#F59E0B', '#D97706', '✨', TRUE),
('Радужная', 'Разноцветная радужная змея', 400, '#EC4899', '#DB2777', '🌈', TRUE),
('Призрачная', 'Прозрачная мистическая змея', 500, '#8B5CF6', '#7C3AED', '👻', TRUE),
('Неоновая', 'Светящаяся неоновая змейка', 600, '#06B6D4', '#0891B2', '💎', TRUE);
