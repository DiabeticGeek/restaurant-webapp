import { createContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../utils/supabaseClient'

type UserRole = 'owner' | 'server' | 'kitchen' | 'bar'

interface UserWithRole extends User {
  role?: UserRole
  restaurantId?: string
}

interface AuthContextType {
  user: UserWithRole | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{
    error: Error | null
    data: Session | null
  }>
  signUp: (email: string, password: string, role: UserRole, restaurantId?: string) => Promise<{
    error: Error | null
    data: Session | null
  }>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserWithRole | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Fetch user role when user changes
  useEffect(() => {
    async function getUserRole() {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('role, restaurant_id')
          .eq('id', user.id)
          .single()

        if (data && !error) {
          setUser((prevUser) => ({
            ...prevUser!,
            role: data.role as UserRole,
            restaurantId: data.restaurant_id
          }))
        }
      }
    }

    if (user) {
      getUserRole()
    }
  }, [user?.id])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data: data.session, error }
  }

  const signUp = async (email: string, password: string, role: UserRole, restaurantId?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (data.session && !error) {
      // Create profile with role
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user?.id,
          role,
          restaurant_id: restaurantId,
        })

      if (profileError) {
        return { data: null, error: profileError }
      }
    }

    return { data: data.session, error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
