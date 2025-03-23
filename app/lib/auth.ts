import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabaseAuth = createClient(supabaseUrl, supabaseKey);

export async function getUserId() {
  const { data: { session }, error } = await supabaseAuth.auth.getSession();
  
  if (error) {
    console.error('Error getting session information:', error);
    throw error;
  }
  
  if (!session?.user?.id) {
    throw new Error('Login required.');
  }
  
  return session.user.id;
}

export async function isUserLoggedIn() {
  try {
    const { data: { session } } = await supabaseAuth.auth.getSession();
    return !!session?.user;
  } catch (error) {
    console.error('Error checking login status:', error);
    return false;
  }
} 