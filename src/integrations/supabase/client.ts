// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://jqtmwfkhugsbgwfaquyh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxdG13ZmtodWdzYmd3ZmFxdXloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NTA3NjksImV4cCI6MjA2MjAyNjc2OX0.1IFZ0876_GCsAYUBaEOs8k0egMJ9tMC3XDpbwv5_nRI";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);