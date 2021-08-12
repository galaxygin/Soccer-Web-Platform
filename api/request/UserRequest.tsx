import { Player } from "../../Definitions";
import { supabase } from "../../SupabaseManager";

export async function getProfile(uid: string): Promise<Player | null> {
    const { data, error } = await supabase.from('players').select('*').eq('uid', uid)
    if (error)
        throw error
    if (data && data.length > 0)
        return { uid: data[0].uid, name: data[0].name, bio: data[0].bio, thumbnailUrl: data[0].thumbnail_url, localArea: data[0].local_area, position: data[0].position, warningScore: data[0].warning_score, blockedPlayers: data[0].blocked_players, lastOnline: data[0].last_online }
    return null
}

export async function updateProfile(uid: string, name: string, bio: string, position: string, localArea: string | null) {
    const { data, error } = await supabase.from('players').update({ name: name, bio: bio, position: position, local_area: localArea }).eq('uid', uid)
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