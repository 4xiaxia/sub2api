import { supabase } from './client'

export async function checkIsAdmin(token: string): Promise<boolean> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return false
    }

    const { data: userData, error } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    return !error && userData?.is_admin === true
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

export async function getAdminUser(token: string) {
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return null
  }

  const { data: userData, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error || !userData?.is_admin) {
    return null
  }

  return userData
}
