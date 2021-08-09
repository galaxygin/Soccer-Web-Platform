import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dhrztufzfjuqcpphkfcx.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNTIwNTUyNiwiZXhwIjoxOTMwNzgxNTI2fQ.8jdF1NgSsVN2VHLJFKLEGKVvM6IxE_vclw1doBN9Rc4'
export const supabase = createClient(supabaseUrl, SUPABASE_KEY)