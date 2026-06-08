-- =============================================
-- BONDE DAS MARAVILHAS — Supabase Schema
-- Cole isso no SQL Editor do seu projeto Supabase
-- =============================================

-- Eventos / Rolês
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT,
  location TEXT,
  notes TEXT,
  status TEXT DEFAULT 'ideia' CHECK (status IN ('ideia', 'confirmado', 'aconteceu')),
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Presenças
CREATE TABLE presences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  member_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, member_id)
);

-- Comentários
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  member_id TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reações nos comentários
CREATE TABLE reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  member_id TEXT NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, member_id, emoji)
);

-- Habilitar Realtime em todas as tabelas
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE presences;
ALTER PUBLICATION supabase_realtime ADD TABLE comments;
ALTER PUBLICATION supabase_realtime ADD TABLE reactions;

-- Row Level Security (RLS) — acesso público de leitura e escrita
-- (o app usa um seletor simples, sem auth real)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE presences ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_all" ON events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON presences FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON comments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON reactions FOR ALL USING (true) WITH CHECK (true);
