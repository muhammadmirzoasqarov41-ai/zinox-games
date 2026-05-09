-- Zinox Games Supabase Database Schema
-- Production Ready Schema for Real-time Gaming

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Players table - Main user data
CREATE TABLE IF NOT EXISTS players (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    telegram VARCHAR(50),
    password_hash TEXT,
    zinox_tokens BIGINT DEFAULT 0,
    cash_balance INTEGER DEFAULT 0,
    tap_power INTEGER DEFAULT 1,
    auto_clicker_level INTEGER DEFAULT 0,
    multiplier_level INTEGER DEFAULT 1,
    combo_master_level INTEGER DEFAULT 0,
    total_clicks BIGINT DEFAULT 0,
    referral_code VARCHAR(8) UNIQUE NOT NULL,
    referred_by VARCHAR(8),
    referral_count INTEGER DEFAULT 0,
    referral_earnings BIGINT DEFAULT 0,
    is_online BOOLEAN DEFAULT false,
    suspicious_activity BOOLEAN DEFAULT false,
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    player_username VARCHAR(50) REFERENCES players(username),
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cash transactions table
CREATE TABLE IF NOT EXISTS cash_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    player_username VARCHAR(50) NOT NULL REFERENCES players(username),
    amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    admin_username VARCHAR(50),
    transaction_type VARCHAR(20) DEFAULT 'distribution', -- distribution, purchase, refund
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game sessions table for analytics
CREATE TABLE IF NOT EXISTS game_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    player_username VARCHAR(50) NOT NULL REFERENCES players(username),
    session_start TIMESTAMPTZ DEFAULT NOW(),
    session_end TIMESTAMPTZ,
    tokens_earned BIGINT DEFAULT 0,
    clicks_made BIGINT DEFAULT 0,
    time_played INTEGER DEFAULT 0, -- seconds
    ip_address INET,
    user_agent TEXT,
    suspicious_activity BOOLEAN DEFAULT false
);

-- Security logs table
CREATE TABLE IF NOT EXISTS security_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    player_username VARCHAR(50) REFERENCES players(username),
    event_type VARCHAR(50) NOT NULL, -- login, logout, suspicious_activity, ban, etc.
    description TEXT,
    ip_address INET,
    user_agent TEXT,
    severity VARCHAR(20) DEFAULT 'info', -- info, warning, error, critical
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    updated_by VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin', -- admin, super_admin, moderator
    permissions JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL, -- click, upgrade, purchase, etc.
    player_username VARCHAR(50) REFERENCES players(username),
    event_data JSONB,
    session_id UUID REFERENCES game_sessions(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Referral tracking table
CREATE TABLE IF NOT EXISTS referral_tracking (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    referral_code VARCHAR(8) NOT NULL REFERENCES players(referral_code),
    referred_username VARCHAR(50) NOT NULL REFERENCES players(username),
    bonus_given BOOLEAN DEFAULT false,
    bonus_amount BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_players_username ON players(username);
CREATE INDEX IF NOT EXISTS idx_players_phone ON players(phone);
CREATE INDEX IF NOT EXISTS idx_players_referral_code ON players(referral_code);
CREATE INDEX IF NOT EXISTS idx_players_is_online ON players(is_online);
CREATE INDEX IF NOT EXISTS idx_players_zinox_tokens ON players(zinox_tokens DESC);
CREATE INDEX IF NOT EXISTS idx_players_last_seen ON players(last_seen DESC);

CREATE INDEX IF NOT EXISTS idx_cash_transactions_player ON cash_transactions(player_username);
CREATE INDEX IF NOT EXISTS idx_cash_transactions_created_at ON cash_transactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_game_sessions_player ON game_sessions(player_username);
CREATE INDEX IF NOT EXISTS idx_game_sessions_session_start ON game_sessions(session_start DESC);

CREATE INDEX IF NOT EXISTS idx_security_logs_player ON security_logs(player_username);
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON security_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_logs_severity ON security_logs(severity);

CREATE INDEX IF NOT EXISTS idx_analytics_events_player ON analytics_events(player_username);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Players table RLS policies
CREATE POLICY "Users can view their own data" ON players
    FOR SELECT USING (auth.uid()::text = username);

CREATE POLICY "Users can update their own data" ON players
    FOR UPDATE USING (auth.uid()::text = username);

CREATE POLICY "Users can insert their own data" ON players
    FOR INSERT WITH CHECK (auth.uid()::text = username);

-- Public read access for leaderboard
CREATE POLICY "Public read access for leaderboard" ON players
    FOR SELECT USING (true);

CREATE POLICY "Public insert access for players" ON players
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update access for players" ON players
    FOR UPDATE USING (true);

CREATE POLICY "Public read access for chat" ON chat_messages
    FOR SELECT USING (true);

CREATE POLICY "Public insert access for chat" ON chat_messages
    FOR INSERT WITH CHECK (true);

-- Cash transactions RLS policies
CREATE POLICY "Users can view their own transactions" ON cash_transactions
    FOR SELECT USING (auth.uid()::text = player_username);

CREATE POLICY "Public read access for cash transactions" ON cash_transactions
    FOR SELECT USING (true);

CREATE POLICY "Public insert access for cash transactions" ON cash_transactions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all transactions" ON cash_transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE username = auth.uid()::text AND is_active = true
        )
    );

-- Game sessions RLS policies
CREATE POLICY "Users can view their own sessions" ON game_sessions
    FOR SELECT USING (auth.uid()::text = player_username);

CREATE POLICY "Users can insert their own sessions" ON game_sessions
    FOR INSERT WITH CHECK (auth.uid()::text = player_username);

-- Analytics events RLS policies
CREATE POLICY "Users can insert their own events" ON analytics_events
    FOR INSERT WITH CHECK (auth.uid()::text = player_username);

-- Security logs RLS policies
CREATE POLICY "Admins can view all security logs" ON security_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE username = auth.uid()::text AND is_active = true
        )
    );

CREATE POLICY "Public read access for security logs" ON security_logs
    FOR SELECT USING (true);

CREATE POLICY "Public insert access for security logs" ON security_logs
    FOR INSERT WITH CHECK (true);

-- Insert initial system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('base_tap_power', '1', 'Boshlang''ich bosish kuchi'),
('auto_save_interval', '30', 'Auto saqlash intervali (sekund)'),
('max_clicks_per_second', '15', 'Maksimal bosish/sekund'),
('cash_exchange_rate', '2000', 'Cash kursi (UZS)'),
('referral_bonus', '100', 'Referal bonus'),
('ad_reward', '50', 'Reklama bonusi'),
('combo_base_time', '3000', 'Combo asosiy vaqti (ms)'),
('anti_cheat_enabled', 'true', 'Anti-cheat tizimi yoqilgan')
ON CONFLICT (setting_key) DO NOTHING;

-- Insert default admin user (password: ZinoxAdmin2024!)
INSERT INTO admin_users (username, password_hash, role, permissions) VALUES
('admin', crypt('ZinoxAdmin2024!', gen_salt('bf')), 'super_admin', 
 '["user_management", "cash_management", "analytics", "security", "settings"]')
ON CONFLICT (username) DO NOTHING;

-- Insert scammer admin user (password: mumkin12)
INSERT INTO admin_users (username, password_hash, role, permissions) VALUES
('scammer', crypt('mumkin12', gen_salt('bf')), 'super_admin', 
 '["user_management", "cash_management", "analytics", "security", "settings"]')
ON CONFLICT (username) DO NOTHING;

-- Create function to update online status
CREATE OR REPLACE FUNCTION update_online_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update last_seen when player is updated
    NEW.last_seen = NOW();
    
    -- If session_end is null, player is online
    NEW.is_online = (NEW.session_end IS NULL);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for online status
CREATE TRIGGER update_player_online_status
    BEFORE UPDATE ON players
    FOR EACH ROW
    EXECUTE FUNCTION update_online_status();

-- Create function for cash distribution
CREATE OR REPLACE FUNCTION distribute_cash(
    p_target_username VARCHAR(50),
    p_amount INTEGER,
    p_reason TEXT,
    p_admin_username VARCHAR(50)
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Update player cash balance
    UPDATE players 
    SET cash_balance = cash_balance + p_amount,
        updated_at = NOW()
    WHERE username = p_target_username;
    
    -- Record transaction
    INSERT INTO cash_transactions (player_username, amount, reason, admin_username, transaction_type)
    VALUES (p_target_username, p_amount, p_reason, p_admin_username, 'distribution');
    
    -- Log the action
    INSERT INTO security_logs (player_username, event_type, description, severity)
    VALUES (p_target_username, 'cash_distribution', 
            format('Admin %s distributed $%s to %s: %s', p_admin_username, p_amount, p_target_username, p_reason),
            'info');
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Create function for suspicious activity detection
CREATE OR REPLACE FUNCTION detect_suspicious_activity(
    p_username VARCHAR(50),
    p_event_type VARCHAR(50),
    p_description TEXT,
    p_severity VARCHAR(20) DEFAULT 'warning'
)
RETURNS VOID AS $$
BEGIN
    -- Log suspicious activity
    INSERT INTO security_logs (player_username, event_type, description, severity)
    VALUES (p_username, p_event_type, p_description, p_severity);
    
    -- Update player suspicious flag if critical
    IF p_severity = 'critical' THEN
        UPDATE players 
        SET suspicious_activity = true,
            updated_at = NOW()
        WHERE username = p_username;
    END IF;
    
    -- Auto-ban if too many critical events
    IF (
        SELECT COUNT(*) 
        FROM security_logs 
        WHERE player_username = p_username 
        AND severity = 'critical' 
        AND created_at > NOW() - INTERVAL '1 hour'
    ) > 5 THEN
        UPDATE players 
        SET suspicious_activity = true,
            updated_at = NOW()
        WHERE username = p_username;
        
        -- Log auto-ban
        INSERT INTO security_logs (player_username, event_type, description, severity)
        VALUES (p_username, 'auto_ban', 'Auto-banned due to excessive suspicious activity', 'critical');
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create view for leaderboard
CREATE OR REPLACE VIEW leaderboard_view AS
SELECT 
    username,
    zinox_tokens,
    cash_balance,
    total_clicks,
    RANK() OVER (ORDER BY zinox_tokens DESC) as rank,
    is_online,
    last_seen
FROM players
ORDER BY zinox_tokens DESC;

-- Create view for admin dashboard stats
CREATE OR REPLACE VIEW admin_stats_view AS
SELECT 
    (SELECT COUNT(*) FROM players) as total_players,
    (SELECT COUNT(*) FROM players WHERE is_online = true) as online_players,
    (SELECT COALESCE(SUM(zinox_tokens), 0) FROM players) as total_tokens,
    (SELECT COALESCE(SUM(cash_balance), 0) FROM players) as total_cash,
    (SELECT COUNT(*) FROM players WHERE suspicious_activity = true) as suspicious_players,
    (SELECT COUNT(*) FROM cash_transactions WHERE created_at > CURRENT_DATE) as daily_cash_distributed,
    (SELECT COUNT(*) FROM players WHERE created_at > CURRENT_DATE) as daily_new_players;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON players TO anon, authenticated;
GRANT ALL ON cash_transactions TO anon, authenticated;
GRANT ALL ON game_sessions TO anon, authenticated;
GRANT ALL ON analytics_events TO anon, authenticated;
GRANT ALL ON referral_tracking TO anon, authenticated;
GRANT ALL ON chat_messages TO anon, authenticated;
GRANT SELECT ON leaderboard_view TO anon, authenticated;
GRANT SELECT ON admin_stats_view TO authenticated;

-- Realtime subscriptions setup
-- These will be automatically handled by Supabase realtime API

-- Comments for documentation
COMMENT ON TABLE players IS 'Foydalanuvchilar asosiy ma''lumotlari';
COMMENT ON TABLE cash_transactions IS 'Cash transaksiyalari tarixi';
COMMENT ON TABLE game_sessions IS 'O''yin sessiyalari va analitika';
COMMENT ON TABLE security_logs IS 'Xavfsazlik loglari';
COMMENT ON TABLE system_settings IS 'Tizim sozlamalari';
COMMENT ON TABLE admin_users IS 'Admin foydalanuvchilari';
COMMENT ON TABLE analytics_events IS 'Analytics hodisalari';
COMMENT ON TABLE referral_tracking IS 'Referal tracking';

COMMENT ON FUNCTION distribute_cash IS 'Cash tarqatish funktsiyasi';
COMMENT ON FUNCTION detect_suspicious_activity IS 'Shubhali faoliyatni aniqlash';
COMMENT ON VIEW leaderboard_view IS 'Reyting jadvali uchun view';
COMMENT ON VIEW admin_stats_view IS 'Admin dashboard statistikasi uchun view';
