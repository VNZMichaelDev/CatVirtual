-- Crear tabla para el estado del gatito
CREATE TABLE IF NOT EXISTS public.pet_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Anlo',
  hunger INTEGER DEFAULT 80 CHECK (hunger >= 0 AND hunger <= 100),
  happiness INTEGER DEFAULT 80 CHECK (happiness >= 0 AND happiness <= 100),
  last_fed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_petted TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_alive BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE public.pet_state ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para proteger los datos
CREATE POLICY "Users can view their own pet" ON public.pet_state 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pet" ON public.pet_state 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pet" ON public.pet_state 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pet" ON public.pet_state 
  FOR DELETE USING (auth.uid() = user_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
CREATE TRIGGER update_pet_state_updated_at 
    BEFORE UPDATE ON public.pet_state 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
