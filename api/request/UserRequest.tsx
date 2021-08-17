import { Player, SimpleProfile } from "../../Definitions";
import { supabase } from "../../SupabaseManager";

export async function getProfile(uid: string): Promise<Player> {
    const { data, error } = await supabase.from('players').select('*').eq('uid', uid)
    if (error)
        throw error
    if (data)
        if (data.length > 0)
            return { uid: data[0].uid, name: data[0].name, bio: data[0].bio, thumbnail_url: data[0].thumbnail_url, local_area: data[0].local_area, position: data[0].position, warning_score: data[0].warning_score, blocked_players: data[0].blocked_players, last_online: data[0].last_online, is_private: data[0].is_private }
    throw new Error("Couldn't get profile")
}

export async function getSimpleProfile(uid: string): Promise<SimpleProfile> {
    const { data, error } = await supabase.from('players').select('name, thumbnail_url, position, is_private').eq('uid', uid)
    if (error)
        throw error
    if (data)
        if (data.length > 0)
            return { uid: uid, name: data[0].name, thumbnail_url: data[0].thumbnail_url, position: data[0].position, is_private: data[0].is_private }
    throw new Error("Couldn't get profile")
}

export async function checkUserRegisteredAsPlayer(uid: string): Promise<boolean> {
    const { data, error } = await supabase.from('players').select('uid').eq('uid', uid)
    if (error)
        throw error
    if (data)
        if (data.length > 0)
            return true
        else
            return false
    throw new Error("Couldn't check if the user is registered as player. Please try again")
}

export async function updateProfile(uid: string, name: string, bio: string, position: string, local_area: string | null, visibility: string) {
    const { data, error } = await supabase.from('players').update({ name: name, bio: bio, position: position, local_area: local_area, is_private: (visibility == "private") ? true : false }).eq('uid', uid)
    if (error)
        throw error
    return data
}

export async function updateEmail(email: string) {
    const { user, error } = await supabase.auth.update({ email: email })
    if (error)
        throw error
    return user
}

export async function updatePassword(password: string) {
    const { user, error } = await supabase.auth.update({ password: password })
    if (error)
        throw error
    return user
}

export async function uploadThumbnail(uid: string, image: File): Promise<string> {
    let { data, error } = await supabase.storage.from('userdata/thumbnails').upload(uid + '.jpg', image, { upsert: true })
    if (error)
        throw error
    return data?.Key!
}

export function getThumbnailDownloadURL(uid: string): string {
    const { publicURL, error } = supabase.storage.from('userdata/thumbnails').getPublicUrl(uid + '.jpg')
    if (error)
        throw error
    return publicURL!
}

export async function updateThumbnailURL(uid: string, url: string) {
    const { data, error } = await supabase.from('players').update({ 'thumbnail_url': url }).eq('uid', uid)
    if (error)
        throw error
    return data
}