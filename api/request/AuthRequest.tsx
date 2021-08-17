import { User } from "@supabase/supabase-js";
import { supabase } from "../../SupabaseManager";

export async function signInWithEmail(email: string, password: string): Promise<User> {
    let { user, error } = await supabase.auth.signIn({ email: email, password: password })
    if (error)
        throw error
    return user!
}

export async function signInWithGoogle(): Promise<User> {
    let { user, error } = await supabase.auth.signIn({ provider: 'google' })
    if (error)
        throw error
    return user!
}

export async function signUp(email: string, password: string): Promise<User> {
    let { user, error } = await supabase.auth.signUp({ email: email, password: password })
    if (error)
        throw error
    return user!
}

export async function addUserToDB(uid: string, name: string, bio: string, thumbnail_url: string | null, local_area: string | null, position: string) {
    const { data, error } = await supabase.from('players').insert([{ uid: uid, name: name, bio: bio, thumbnail_url: thumbnail_url, local_area: localArea, position: position }])
    if (error)
        throw error
    return data
}

export function getUser() {
    return supabase.auth.user()
}

export async function signOut() {
    let { error } = await supabase.auth.signOut()
    if (error)
        throw error
}

export async function sendPWResetEmail(email: string) {
    let { data, error } = await supabase.auth.api.resetPasswordForEmail(email)
    if (error)
        throw error
    return data
}

export async function deleteAccount() {
}