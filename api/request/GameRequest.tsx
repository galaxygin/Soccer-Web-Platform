import { formatDateToString, formatTimeToString, getMondayOfTheWeek, getSundayOfTheWeek } from "../../components/DateManager";
import { Game, GameMetaData, Player } from "../../Definitions";
import { supabase } from "../../SupabaseManager";

export async function getGameMetaData(id: string): Promise<GameMetaData> {
    const { data, error } = await supabase.from("games").select("organizer, title, description, passcode").match({ "id": id })
    if (error)
        throw error
    if (data)
        if (data.length > 0)
            return { id: id, organizer: data[0].organizer, title: data[0].title, description: data[0].description, passcode: (data[0].passcode) ? true : false }
    throw new Error("Could not get game details")
}

//If there is a header that holding a token of uid, we'll be able to
//check if the user is the organizer or not
export async function getGame(id: string): Promise<Game> {
    const { data, error } = await supabase.from("games").select("*, organizer: organizer(*)").match({ "id": id })
    if (error)
        throw error
    if (data)
        if (data.length > 0)
            return { id: id, organizer: data[0].organizer, title: data[0].title, description: data[0].description, location: data[0].location, date: data[0].date, time: data[0].time, playerLevel: data[0].player_level, passcode: data[0].passcode, participants: (await getParticipants(id)).length, maxPlayers: data[0].max_players, minPlayers: data[0].min_players, customRules: data[0].custom_rules, requirements: data[0].requirements, status: data[0].status }
    throw new Error("Could not get game details")
}

export async function getGameWithPasscode(id: string, passcode: string): Promise<Game> {
    const { data, error } = await supabase.from("games").select("*, organizer: organizer(*)").match({ "id": id, "passcode": passcode })
    if (error)
        throw error
    if (data)
        if (data.length > 0)
            return { id: id, organizer: data[0].organizer, title: data[0].title, description: data[0].description, location: data[0].location, date: data[0].date, time: data[0].time, playerLevel: data[0].player_level, passcode: passcode, participants: (await getParticipants(id)).length, maxPlayers: data[0].max_players, minPlayers: data[0].min_players, customRules: data[0].custom_rules, requirements: data[0].requirements, status: data[0].status }
    throw new Error("Could not get game details")
}

export async function organizeGame(uid: string, title: string, description: string, location: string, date: Date, time: Date, playerLevel: number, passcode: string | null, maxPlayers: number | null, minPlayers: number | null, customRules: string | null, requirements: string | null) {
    const { data, error } = await supabase.from("games").insert({ organizer: uid, title: title, description: description, location: location, date: formatDateToString(date), time: formatTimeToString(time), player_level: playerLevel, passcode: passcode, max_players: maxPlayers, min_players: minPlayers, custom_rules: customRules, requirements: requirements })
    if (error)
        throw error
    let { data: game_id } = await supabase.from("games").select("id").order('timestamp', { ascending: false }).eq('organizer', uid)
    await supabase.from("participants").insert({ id: game_id![0].id, game_id: game_id![0].id, uid: uid })
    return data
}

export async function updateGameDetail(game_id: string, title: string, description: string, location: string, date: Date, time: Date, playerLevel: number, passcode: string | null, maxPlayers: number | null, minPlayers: number | null, customRules: string | null, requirements: string | null) {
    console.log(formatTimeToString(time) + ":00")
    const { data, error } = await supabase.from("games").update({ title: title, description: description, location: location, date: formatDateToString(date), time: formatTimeToString(time) + ":00", player_level: playerLevel, passcode: passcode, max_players: maxPlayers, min_players: minPlayers, custom_rules: customRules, requirements: requirements }).eq("id", game_id)
    if (error)
        throw error
    return data
}

export async function cancelGame(game_id: string) {
    const { data, error } = await supabase.from("games").update({ status: "cancelled" }).match({ "id": game_id })
    if (error)
        throw error
    return data
}

export async function checkIsOrganizer(game_id: string, uid: string) {
    const { data, error } = await supabase.from("games").select("*").match({ "id": game_id, "organizer": uid })
    if (error)
        throw error
    if (data)
        if (data.length > 0)
            return true
        else
            return false
    throw new Error("Couldn't check if the user is organizer")
}

export async function joinAGame(game_id: string, uid: string) {
    const { data, error } = await supabase.from("participants").insert({ id: game_id, game_id: game_id, uid: uid })
    if (error)
        throw error
    return data
}

export async function cancelRSVP(game_id: string, uid: string) {
    const { data, error } = await supabase.from("participants").delete().match({ "game_id": game_id, "uid": uid })
    if (error)
        throw error
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

export async function checkIsAlreadyJoining(game_id: string, uid: string): Promise<boolean> {
    if (!game_id || !uid)
        return false
    const { data, error } = await supabase.from("participants").select("*").match({ "game_id": game_id, "uid": uid })
    if (error)
        throw error
    if (data)
        if (data.length > 0)
            return true
        else
            return false
    throw new Error("Couldn't check the user is already joining")
}

export async function getTodaysGames(): Promise<Game[]> {
    const { data, error } = await supabase.from("games").select("*, organizer: organizer(*)").filter("date", "eq", formatDateToString(new Date())).order("time", { ascending: true })
    if (error)
        throw error
    const games: Game[] = []
    data?.forEach(async game => {
        //(await getParticipants(game.id)).length <= Doing this by await here makes the page doesn't switch the view auto
        games.push({ id: game.id, organizer: game.organizer, title: game.title, description: game.description, location: game.location, date: game.date, time: game.time, playerLevel: game.player_level, passcode: game.passcode, participants: 1, maxPlayers: game.max_players, minPlayers: game.min_players, customRules: game.custom_rules, requirements: game.requirements, status: game.status })
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
        games.push({ id: game.id, organizer: game.organizer, title: game.title, description: game.description, location: game.location, date: game.date, time: game.time, playerLevel: game.player_level, passcode: game.passcode, participants: 1, maxPlayers: game.max_players, minPlayers: game.min_players, customRules: game.custom_rules, requirements: game.requirements, status: game.status })
    })
    return games
}