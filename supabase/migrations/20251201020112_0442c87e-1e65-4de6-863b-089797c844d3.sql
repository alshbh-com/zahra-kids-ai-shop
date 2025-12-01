-- Create settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  password text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Create policy
DROP POLICY IF EXISTS "Allow all on settings" ON public.settings;
CREATE POLICY "Allow all on settings" ON public.settings FOR ALL USING (true);

-- Insert or update password
INSERT INTO public.settings (password) 
VALUES ('Magdi17121997')
ON CONFLICT (id) DO UPDATE 
SET password = 'Magdi17121997';

-- If there are existing records with old password, update them
UPDATE public.settings 
SET password = 'Magdi17121997' 
WHERE password = '0127800624801204486263';