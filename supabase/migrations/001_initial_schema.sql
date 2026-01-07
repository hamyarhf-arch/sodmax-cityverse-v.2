-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    avatar_url TEXT,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    referral_code VARCHAR(20) UNIQUE,
    referred_by UUID REFERENCES users(id),
    total_earned NUMERIC DEFAULT 0,
    join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User authentication
CREATE TABLE user_auth (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    password_hash TEXT NOT NULL,
    phone_verified BOOLEAN DEFAULT FALSE,
    verification_code VARCHAR(6),
    verification_expires TIMESTAMP WITH TIME ZONE,
    last_password_change TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User wallet
CREATE TABLE user_wallets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    sod_balance NUMERIC DEFAULT 1000,
    toman_balance NUMERIC DEFAULT 0,
    usdt_balance NUMERIC DEFAULT 0,
    total_deposited NUMERIC DEFAULT 0,
    total_withdrawn NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mining system
CREATE TABLE mining_stats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    mining_power INTEGER DEFAULT 5,
    mining_multiplier NUMERIC DEFAULT 1,
    auto_mining BOOLEAN DEFAULT FALSE,
    today_earned NUMERIC DEFAULT 0,
    total_mined NUMERIC DEFAULT 0,
    last_mine_time TIMESTAMP WITH TIME ZONE,
    boost_end_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mining upgrades
CREATE TABLE mining_upgrades (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    upgrade_type VARCHAR(50) NOT NULL,
    level INTEGER DEFAULT 1,
    cost NUMERIC NOT NULL,
    effect_value NUMERIC NOT NULL,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business campaigns
CREATE TABLE business_campaigns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    campaign_type VARCHAR(50) NOT NULL, -- click, view, share, install, purchase
    reward_type VARCHAR(20) NOT NULL, -- sod, toman, both
    reward_sod NUMERIC DEFAULT 0,
    reward_toman NUMERIC DEFAULT 0,
    total_budget NUMERIC NOT NULL,
    spent_budget NUMERIC DEFAULT 0,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- active, paused, completed, expired
    requirements JSONB, -- JSON for specific requirements
    target_audience JSONB, -- Target criteria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaign participation
CREATE TABLE campaign_participations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    campaign_id UUID REFERENCES business_campaigns(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    participation_type VARCHAR(50) NOT NULL,
    completion_data JSONB, -- Data about completion
    progress INTEGER DEFAULT 0,
    max_progress INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'in_progress', -- in_progress, completed, verified, paid
    reward_sod NUMERIC DEFAULT 0,
    reward_toman NUMERIC DEFAULT 0,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(campaign_id, user_id)
);

-- Transactions
CREATE TABLE transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL, -- mining, campaign, referral, deposit, withdrawal
    amount NUMERIC NOT NULL,
    currency VARCHAR(10) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed, cancelled
    reference_id UUID, -- Reference to source (campaign_id, referral_id, etc.)
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referral system
CREATE TABLE referrals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    referred_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending', -- pending, registered, completed_first_task, earned
    reward_paid BOOLEAN DEFAULT FALSE,
    reward_amount NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- User missions/achievements
CREATE TABLE user_missions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    mission_type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    reward_sod NUMERIC DEFAULT 0,
    reward_toman NUMERIC DEFAULT 0,
    progress INTEGER DEFAULT 0,
    target INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- active, completed, claimed
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily rewards
CREATE TABLE daily_rewards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reward_day INTEGER NOT NULL, -- Day in streak
    reward_sod NUMERIC NOT NULL,
    reward_toman NUMERIC NOT NULL,
    claimed BOOLEAN DEFAULT FALSE,
    claimed_at TIMESTAMP WITH TIME ZONE,
    created_at DATE DEFAULT CURRENT_DATE
);

-- Notifications
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- info, success, warning, error
    read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Businesses
CREATE TABLE businesses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    total_spent NUMERIC DEFAULT 0,
    active_campaigns INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business admins
CREATE TABLE business_admins (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Withdrawal requests
CREATE TABLE withdrawal_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    currency VARCHAR(10) NOT NULL,
    withdrawal_method VARCHAR(50) NOT NULL, -- bank, crypto, etc.
    account_details JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
    transaction_hash TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs
CREATE TABLE audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_campaigns_status ON business_campaigns(status, end_date);
CREATE INDEX idx_campaigns_business ON business_campaigns(business_id);
CREATE INDEX idx_participations_user ON campaign_participations(user_id);
CREATE INDEX idx_participations_campaign ON campaign_participations(campaign_id);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_mining_user ON mining_stats(user_id);
CREATE INDEX idx_wallet_user ON user_wallets(user_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred ON referrals(referred_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_wallets_updated_at BEFORE UPDATE ON user_wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mining_stats_updated_at BEFORE UPDATE ON mining_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_campaigns_updated_at BEFORE UPDATE ON business_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate referral code
CREATE OR REPLACE FUNCTION generate_referral_code(name TEXT)
RETURNS VARCHAR(20) AS $$
DECLARE
    name_part VARCHAR(3);
    random_part INTEGER;
    code VARCHAR(20);
BEGIN
    name_part := UPPER(REGEXP_REPLACE(SUBSTRING(name FROM 1 FOR 3), '[^A-Za-z]', ''));
    IF LENGTH(name_part) < 3 THEN
        name_part := name_part || SUBSTRING('ABCDEFGHIJKLMNOPQRSTUVWXYZ' FROM (random() * 26)::INTEGER + 1 FOR 1);
    END IF;
    
    random_part := floor(random() * 90000 + 10000);
    code := name_part || random_part::VARCHAR;
    
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate level from experience
CREATE OR REPLACE FUNCTION calculate_level(exp INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN FLOOR(SQRT(exp / 100))::INTEGER + 1;
END;
$$ LANGUAGE plpgsql;

-- Function to check campaign availability
CREATE OR REPLACE FUNCTION check_campaign_availability()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if campaign is active and not expired
    IF NEW.status = 'active' AND (NEW.end_date < NOW() OR NEW.spent_budget >= NEW.total_budget) THEN
        NEW.status := 'completed';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_campaign_status BEFORE INSERT OR UPDATE ON business_campaigns
    FOR EACH ROW EXECUTE FUNCTION check_campaign_availability();

-- Function to process campaign reward
CREATE OR REPLACE FUNCTION process_campaign_reward()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Add reward to user wallet
        UPDATE user_wallets 
        SET sod_balance = sod_balance + NEW.reward_sod,
            toman_balance = toman_balance + NEW.reward_toman,
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
        
        -- Record transaction
        INSERT INTO transactions (user_id, transaction_type, amount, currency, description, status, reference_id)
        VALUES (
            NEW.user_id,
            'campaign_reward',
            NEW.reward_sod + NEW.reward_toman,
            CASE WHEN NEW.reward_sod > 0 AND NEW.reward_toman > 0 THEN 'both' 
                 WHEN NEW.reward_sod > 0 THEN 'sod' 
                 ELSE 'toman' END,
            'پاداش کمپین: ' || (SELECT title FROM business_campaigns WHERE id = NEW.campaign_id),
            'completed',
            NEW.campaign_id
        );
        
        -- Update campaign spent budget
        UPDATE business_campaigns 
        SET spent_budget = spent_budget + NEW.reward_sod + NEW.reward_toman,
            current_participants = current_participants + 1,
            updated_at = NOW()
        WHERE id = NEW.campaign_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER process_campaign_reward_trigger AFTER UPDATE ON campaign_participations
    FOR EACH ROW EXECUTE FUNCTION process_campaign_reward();

-- Initial data seeding
INSERT INTO businesses (id, name, description, website_url, status) VALUES
(uuid_generate_v4(), 'دیجی‌کالا', 'فروشگاه اینترنتی دیجی‌کالا', 'https://digikala.com', 'active'),
(uuid_generate_v4(), 'اسنپ', 'سرویس درخواست آنلاین خودرو', 'https://snapp.ir', 'active'),
(uuid_generate_v4(), 'آپ', 'اپلیکیشن پرداخت و کیف پول', 'https://ap.ir', 'active');

-- Sample campaigns
INSERT INTO business_campaigns (
    id,
    business_id,
    title,
    description,
    campaign_type,
    reward_type,
    reward_sod,
    reward_toman,
    total_budget,
    max_participants,
    start_date,
    end_date,
    requirements
) SELECT 
    uuid_generate_v4(),
    b.id,
    'کلیک بر روی تبلیغ',
    'کلیک بر روی تبلیغ و مشاهده ۳۰ ثانیه‌ای',
    'click',
    'both',
    500,
    1000,
    1000000,
    1000,
    NOW(),
    NOW() + INTERVAL '30 days',
    '{"min_clicks": 1, "view_duration": 30}'
FROM businesses b WHERE b.name = 'دیجی‌کالا'
UNION ALL
SELECT 
    uuid_generate_v4(),
    b.id,
    'نصب اپلیکیشن',
    'نصب و ثبت‌نام در اپلیکیشن اسنپ',
    'install',
    'toman',
    0,
    5000,
    5000000,
    500,
    NOW(),
    NOW() + INTERVAL '60 days',
    '{"app_id": "com.snapp.taxi", "registration_required": true}'
FROM businesses b WHERE b.name = 'اسنپ'
UNION ALL
SELECT 
    uuid_generate_v4(),
    b.id,
    'اشتراک‌گذاری در شبکه‌های اجتماعی',
    'اشتراک‌گذاری پست در اینستاگرام یا تلگرام',
    'share',
    'sod',
    2000,
    0,
    2000000,
    2000,
    NOW(),
    NOW() + INTERVAL '15 days',
    '{"platforms": ["instagram", "telegram"], "min_followers": 100}'
FROM businesses b WHERE b.name = 'آپ';

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE mining_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_participations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can read their own data
CREATE POLICY "Users can read own data" ON users
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Public can read business campaigns
CREATE POLICY "Public can read active campaigns" ON business_campaigns
    FOR SELECT USING (status = 'active' AND end_date > NOW());

-- Users can read their own participations
CREATE POLICY "Users can read own participations" ON campaign_participations
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own participations
CREATE POLICY "Users can insert own participations" ON campaign_participations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can read their own wallets
CREATE POLICY "Users can read own wallet" ON user_wallets
    FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own wallets (limited)
CREATE POLICY "Users can update own wallet" ON user_wallets
    FOR UPDATE USING (auth.uid() = user_id);
