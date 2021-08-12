import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kjtrccxoysjwycxmpwvm.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYyODUwMDc3OCwiZXhwIjoxOTQ0MDc2Nzc4fQ.S-aiamH7VvmP5g-0h_gzxMyxNYbtLT-urkAQFzr9rZg'
export const supabase = createClient(supabaseUrl, SUPABASE_KEY)