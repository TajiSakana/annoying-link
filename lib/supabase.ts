import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ojqdnanqqudcqswrxnso.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qcWRuYW5xcXVkY3Fzd3J4bnNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MDczODYsImV4cCI6MjA5MjQ4MzM4Nn0.vyj85fX_h2D-rnN5YZPW42klIVbVIKfQyaylzqZgG6I'

export const supabase = createClient(supabaseUrl, supabaseKey)