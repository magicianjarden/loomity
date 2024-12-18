-- Create enum types
CREATE TYPE plugin_category AS ENUM (
  'text_formatting',
  'content_organization',
  'media_embeds',
  'collaboration',
  'advanced_editing',
  'layout_structure',
  'developer_tools',
  'productivity'
);

CREATE TYPE plugin_status AS ENUM (
  'active',
  'disabled',
  'deprecated',
  'beta'
);

CREATE TYPE pricing_type AS ENUM (
  'free',
  'paid',
  'subscription'
);

CREATE TYPE analytics_period AS ENUM (
  'daily',
  'weekly',
  'monthly',
  'yearly'
);

-- Create plugins table
CREATE TABLE plugins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  version VARCHAR(50) NOT NULL,
  author UUID REFERENCES auth.users(id),
  website VARCHAR(255),
  repository VARCHAR(255),
  license VARCHAR(100) NOT NULL,
  category plugin_category NOT NULL,
  tags TEXT[] DEFAULT '{}',
  status plugin_status DEFAULT 'beta',
  permissions JSONB NOT NULL DEFAULT '{
    "read": true,
    "write": false,
    "execute": false
  }',
  pricing JSONB NOT NULL DEFAULT '{
    "type": "free"
  }',
  configuration JSONB NOT NULL DEFAULT '{
    "enabled": true,
    "settings": {}
  }',
  dependencies JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(name, version)
);

-- Create plugin installations table
CREATE TABLE plugin_installations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  plugin_id UUID REFERENCES plugins(id),
  workspace_id UUID REFERENCES workspaces(id),
  configuration JSONB NOT NULL DEFAULT '{
    "enabled": true,
    "settings": {}
  }',
  installed_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, plugin_id, workspace_id)
);

-- Create plugin events table
CREATE TABLE plugin_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plugin_id UUID REFERENCES plugins(id),
  user_id UUID REFERENCES auth.users(id),
  workspace_id UUID REFERENCES workspaces(id),
  event_type VARCHAR(100) NOT NULL,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create plugin analytics table
CREATE TABLE plugin_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plugin_id UUID REFERENCES plugins(id),
  installations INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  usage_count INTEGER DEFAULT 0,
  avg_rating DECIMAL(3,2) DEFAULT 0,
  revenue DECIMAL(10,2),
  period analytics_period NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(plugin_id, period, date)
);

-- Create plugin reviews table
CREATE TABLE plugin_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plugin_id UUID REFERENCES plugins(id),
  user_id UUID REFERENCES auth.users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(plugin_id, user_id)
);

-- Create indexes
CREATE INDEX idx_plugins_category ON plugins(category);
CREATE INDEX idx_plugins_status ON plugins(status);
CREATE INDEX idx_plugins_author ON plugins(author);
CREATE INDEX idx_plugin_installations_user ON plugin_installations(user_id);
CREATE INDEX idx_plugin_installations_plugin ON plugin_installations(plugin_id);
CREATE INDEX idx_plugin_installations_workspace ON plugin_installations(workspace_id);
CREATE INDEX idx_plugin_events_plugin ON plugin_events(plugin_id);
CREATE INDEX idx_plugin_events_user ON plugin_events(user_id);
CREATE INDEX idx_plugin_analytics_plugin ON plugin_analytics(plugin_id);
CREATE INDEX idx_plugin_reviews_plugin ON plugin_reviews(plugin_id);
CREATE INDEX idx_plugin_reviews_user ON plugin_reviews(user_id);

-- Create RLS policies
ALTER TABLE plugins ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_reviews ENABLE ROW LEVEL SECURITY;

-- Plugins policies
CREATE POLICY "Public plugins are viewable by everyone"
  ON plugins FOR SELECT
  USING (true);

CREATE POLICY "Users can create plugins"
  ON plugins FOR INSERT
  WITH CHECK (auth.uid() = author);

CREATE POLICY "Plugin authors can update their plugins"
  ON plugins FOR UPDATE
  USING (auth.uid() = author);

-- Plugin installations policies
CREATE POLICY "Users can view their plugin installations"
  ON plugin_installations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can install plugins"
  ON plugin_installations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their plugin installations"
  ON plugin_installations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can uninstall plugins"
  ON plugin_installations FOR DELETE
  USING (auth.uid() = user_id);

-- Plugin events policies
CREATE POLICY "Plugin authors can view their plugin events"
  ON plugin_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM plugins
      WHERE plugins.id = plugin_events.plugin_id
      AND plugins.author = auth.uid()
    )
  );

CREATE POLICY "Users can create events for installed plugins"
  ON plugin_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM plugin_installations
      WHERE plugin_installations.plugin_id = plugin_events.plugin_id
      AND plugin_installations.user_id = auth.uid()
    )
  );

-- Plugin analytics policies
CREATE POLICY "Plugin authors can view their analytics"
  ON plugin_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM plugins
      WHERE plugins.id = plugin_analytics.plugin_id
      AND plugins.author = auth.uid()
    )
  );

-- Plugin reviews policies
CREATE POLICY "Public reviews are viewable by everyone"
  ON plugin_reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews for installed plugins"
  ON plugin_reviews FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM plugin_installations
      WHERE plugin_installations.plugin_id = plugin_reviews.plugin_id
      AND plugin_installations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their reviews"
  ON plugin_reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- Create functions for analytics
CREATE OR REPLACE FUNCTION update_plugin_analytics()
RETURNS trigger AS $$
BEGIN
  -- Update daily analytics
  INSERT INTO plugin_analytics (
    plugin_id,
    installations,
    active_users,
    usage_count,
    period,
    date
  )
  SELECT
    NEW.plugin_id,
    COUNT(DISTINCT user_id),
    COUNT(DISTINCT user_id) FILTER (WHERE updated_at > NOW() - INTERVAL '1 day'),
    COUNT(*),
    'daily'::analytics_period,
    CURRENT_DATE
  FROM plugin_installations
  WHERE plugin_id = NEW.plugin_id
  GROUP BY plugin_id
  ON CONFLICT (plugin_id, period, date)
  DO UPDATE SET
    installations = EXCLUDED.installations,
    active_users = EXCLUDED.active_users,
    usage_count = plugin_analytics.usage_count + 1;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for analytics
CREATE TRIGGER trigger_plugin_event
  AFTER INSERT ON plugin_events
  FOR EACH ROW
  EXECUTE FUNCTION update_plugin_analytics();
