import { formatDateToString, formatTimeToString, getMondayOfTheWeek, getSundayOfTheWeek } from "../../components/DateManager";
import { Game, Player } from "../../Definitions";
import { supabase } from "../../SupabaseManager";

export async function getGame(id: string): Promise<Game | null> {
    const { data, error } = await supabase.from("games").select("*, organizer: organizer(*)").eq("id", id)
    if (error)
        throw error
    if (data && data.length > 0)
        return { id: id, organizer: data[0].organizer, title: data[0].title, description: data[0].description, location: data[0].location, date: data[0].date, time: data[0].time, playerLevel: data[0].player_level, passcode: data[0].passcode, participants: (await getParticipants(id)).length, maxPlayers: data[0].max_players, minPlayers: data[0].min_players, customRules: data[0].custom_rules, requirements: data[0].requirements }
    return null
}

export async function getGameWithPasscode(id: string, passcode: string): Promise<Game | null> {
    const { data, error } = await supabase.from("games").select("*, organizer: organizer(*)").match({ "id": id, "passcode": passcode })
    if (error)
        throw error
    if (data && data.length > 0)
        return { id: id, organizer: data[0].organizer, title: data[0].title, description: data[0].description, location: data[0].location, date: data[0].date, time: data[0].time, playerLevel: data[0].player_level, passcode: data[0].passcode, participants: (await getParticipants(id)).length, maxPlayers: data[0].max_players, minPlayers: data[0].min_players, customRules: data[0].custom_rules, requirements: data[0].requirements }
    return null
}

export async function organizeGame(uid: string, title: string, description: string, location: string, date: Date, time: Date, playerLevel: number, passcode: string | null, maxPlayers: number | null, minPlayers: number | null, customRules: string | null, requirements: string | null) {
    const { data, error } = await supabase.from("games").insert({ organizer: uid, title: title, description: description, location: location, date: formatDateToString(date), time: formatTimeToString(time), player_level: playerLevel, passcode: passcode, max_players: maxPlayers, min_players: minPlayers, custom_rules: customRules, requirements: requirements })
    if (error)
        throw error
    let { data: game_id } = await supabase.from("games").select("id").order('timestamp', { ascending: false }).eq('organizer', uid)
    await supabase.from("participants").insert({ game_id: game_id![0].id, uid: uid })
    return data
}

export async function joinAGame(game_id: string, uid: string) {
    const { data, error } = await supabase.from("participants").select("*").match({ "game_id": game_id, "uid": uid })
    if (error)
        throw error
    if (data)
        if (data.length > 0)
            throw new Error("You are already joining this game")
        else
            await supabase.from("participants").insert({ id: game_id, game_id: game_id, uid: uid })
    else
        throw new Error("Couldn't check whether the player is already participating")
    return data
}

export async function getParticipants(game_id: string): Promise<Player[]> {
    const { data, error } = await supabase.from("participants").select("player: uid(*)").eq("game_id", game_id)
    if (error)
        throw error
    const participants: Player[] = []
    data?.forEach((participant) => {
        participants.push({ uid: participant.player.uid, name: participant.player.name, bio: participant.player.bio, thumbnailUrl: participant.player.thumbnail_url, localArea: participant.player.local_area, position: participant.player.position, warningScore: participant.player.warning_score, blockedPlayers: participant.player.blocked_players, lastOnline: participant.player.last_online })
    })
    return participants
}

export async function getTodaysGames(): Promise<Game[]> {
    const { data, error } = await supabase.from("games").select("*, organizer: organizer(*)").filter("date", "eq", formatDateToString(new Date())).order("time", { ascending: true })
    if (error)
        throw error
    const games: Game[] = []
    data?.forEach(async game => {
        //(await getParticipants(game.id)).length <= Doing this by await here makes the page doesn't switch the view auto
        games.push({ id: game.id, organizer: game.organizer, title: game.title, description: game.description, location: game.location, date: game.date, time: game.time, playerLevel: game.player_level, passcode: game.passcode, participants: 1, maxPlayers: game.max_players, minPlayers: game.min_players, customRules: game.custom_rules, requirements: game.requirements })
    })
    return games
}

export async function getGamesOfTheWeek(): Promise<Game[]> {
    const { data, error } = await supabase.from("games").select("*, organizer: organizer(*)").filter("date", "gte", formatDateToString(getMondayOfTheWeek())).filter("date", "lte", formatDateToString(getSundayOfTheWeek())).order("date", { ascending: true }).order("time", { ascending: true })
    if (error)
        throw error
    const games: Game[] = []
    data?.forEach(async game => {
        //(await getParticipants(game.id)).length <= Doing this by await here makes the page doesn't switch the view auto
        games.push({ id: game.id, organizer: game.organizer, title: game.title, description: game.description, location: game.location, date: game.date, time: game.time, playerLevel: game.player_level, passcode: game.passcode, participants: 1, maxPlayers: game.max_players, minPlayers: game.min_players, customRules: game.custom_rules, requirements: game.requirements })
    })
    return games
}