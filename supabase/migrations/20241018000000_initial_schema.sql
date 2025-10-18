-- Dream Journal Database Schema
-- Migration: Initial Setup

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Dreams table: Stores the main dream session
CREATE TABLE dreams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transcript TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Story nodes table: Stores each narrative node in the dream
CREATE TABLE story_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dream_id UUID NOT NULL REFERENCES dreams(id) ON DELETE CASCADE,
  parent_node_id UUID REFERENCES story_nodes(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Story options table: Stores the choice branches from each node
CREATE TABLE story_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_node_id UUID NOT NULL REFERENCES story_nodes(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  next_node_id UUID REFERENCES story_nodes(id) ON DELETE SET NULL
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_dreams_user_id ON dreams(user_id);
CREATE INDEX idx_dreams_created_at ON dreams(created_at DESC);
CREATE INDEX idx_story_nodes_dream_id ON story_nodes(dream_id);
CREATE INDEX idx_story_nodes_parent_id ON story_nodes(parent_node_id);
CREATE INDEX idx_story_options_node_id ON story_options(story_node_id);
CREATE INDEX idx_story_options_next_node ON story_options(next_node_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE dreams ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_options ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dreams table
CREATE POLICY "Users can view their own dreams"
  ON dreams FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own dreams"
  ON dreams FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dreams"
  ON dreams FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dreams"
  ON dreams FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for story_nodes table
CREATE POLICY "Users can view story nodes from their dreams"
  ON story_nodes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM dreams 
      WHERE dreams.id = story_nodes.dream_id 
      AND dreams.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert story nodes to their dreams"
  ON story_nodes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dreams 
      WHERE dreams.id = story_nodes.dream_id 
      AND dreams.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update story nodes in their dreams"
  ON story_nodes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM dreams 
      WHERE dreams.id = story_nodes.dream_id 
      AND dreams.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete story nodes from their dreams"
  ON story_nodes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM dreams 
      WHERE dreams.id = story_nodes.dream_id 
      AND dreams.user_id = auth.uid()
    )
  );

-- RLS Policies for story_options table
CREATE POLICY "Users can view options from their story nodes"
  ON story_options FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM story_nodes
      JOIN dreams ON dreams.id = story_nodes.dream_id
      WHERE story_nodes.id = story_options.story_node_id
      AND dreams.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert options to their story nodes"
  ON story_options FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM story_nodes
      JOIN dreams ON dreams.id = story_nodes.dream_id
      WHERE story_nodes.id = story_options.story_node_id
      AND dreams.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update options in their story nodes"
  ON story_options FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM story_nodes
      JOIN dreams ON dreams.id = story_nodes.dream_id
      WHERE story_nodes.id = story_options.story_node_id
      AND dreams.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete options from their story nodes"
  ON story_options FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM story_nodes
      JOIN dreams ON dreams.id = story_nodes.dream_id
      WHERE story_nodes.id = story_options.story_node_id
      AND dreams.user_id = auth.uid()
    )
  );

-- ============================================================================
-- FUNCTIONS & TRIGGERS (Optional: for future enhancements)
-- ============================================================================

-- Function to get dream tree structure
CREATE OR REPLACE FUNCTION get_dream_tree(dream_uuid UUID)
RETURNS TABLE (
  node_id UUID,
  parent_id UUID,
  content TEXT,
  video_url TEXT,
  depth INT
) AS $$
  WITH RECURSIVE dream_tree AS (
    -- Base case: root nodes (no parent)
    SELECT 
      id as node_id,
      parent_node_id as parent_id,
      content,
      video_url,
      0 as depth
    FROM story_nodes
    WHERE dream_id = dream_uuid AND parent_node_id IS NULL
    
    UNION ALL
    
    -- Recursive case: child nodes
    SELECT 
      sn.id,
      sn.parent_node_id,
      sn.content,
      sn.video_url,
      dt.depth + 1
    FROM story_nodes sn
    INNER JOIN dream_tree dt ON sn.parent_node_id = dt.node_id
    WHERE sn.dream_id = dream_uuid
  )
  SELECT * FROM dream_tree ORDER BY depth, node_id;
$$ LANGUAGE SQL STABLE;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_dream_tree(UUID) TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE dreams IS 'Stores dream journal sessions';
COMMENT ON TABLE story_nodes IS 'Stores narrative nodes in the dream story tree';
COMMENT ON TABLE story_options IS 'Stores branching choices for each story node';
COMMENT ON FUNCTION get_dream_tree IS 'Retrieves the complete story tree for a dream session';

