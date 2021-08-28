import { formatDateToString, getMondayOfTheWeek, getNextMonday } from "../../components/DateManager";
import { Game, GameHeader, GameMetaData, Message, SimpleProfile } from "../../Definitions";
import { supabase } from "../../SupabaseManager";

//We can cosider adding the filter of excluding passed games
export async function getMyGames(uid: string): Promise<GameHeader[]> {
    const { data, error } = await supabase.from("participants").select("game: game_id(id, title, organizer(uid, name, thumbnail_url, position, is_private), location, date, time, player_level, participants, passcode, status)").order("timestamp", { ascending: true }).eq("uid", uid)
    if (error)
        throw error
    const games: GameHeader[] = []
    data?.forEach(item => {
        games.push({ id: item.game.id, organizer: item.game.organizer, title: item.game.title, location: item.game.location, date: item.game.date, time: item.game.time, player_level: item.game.player_level, passcode: item.game.passcode, participants: item.game.participants, status: item.game.status })
    })
    return games
}

export async function getTodaysGames(): Promise<GameHeader[]> {
    const { data, error } = await supabase.from("games").select("id, organizer: organizer(uid, name, thumbnail_url, is_private), title, location, date, time, player_level, participants, passcode, status").filter("date", "eq", formatDateToString(new Date())).order("time", { ascending: true })
    if (error)
        throw error
    const games: GameHeader[] = []
    data?.forEach(game => {
        games.push({ id: game.id, organizer: game.organizer, title: game.title, location: game.location, date: game.date, time: game.time, player_level: game.player_level, passcode: game.passcode, participants: game.participants, status: game.status })
    })
    return games
}

export async function getGamesOfTheWeek(): Promise<GameHeader[]> {
    const { data, error } = await supabase.from("games").select("id, organizer: organizer(uid, name, thumbnail_url, is_private), title, location, date, time, player_level, participants, passcode, status").filter("date", "gte", formatDateToString(getMondayOfTheWeek())).filter("date", "lt", formatDateToString(getNextMonday())).order("date", { ascending: true }).order("time", { ascending: true })
    if (error)
        throw error
    const games: GameHeader[] = []
    data?.forEach(game => {
        games.push({ id: game.id, organizer: game.organizer, title: game.title, location: game.location, date: game.date, time: game.time, player_level: game.player_level, passcode: game.passcode, participants: game.participants, status: game.status })
    })
    return games
}

export async function searchGames(title: string, location?: string, level: number = 0, date: Date = new Date(), time?: string): Promise<GameHeader[]> {
    const db = supabase.from("games").select("id, organizer: organizer(uid, name, thumbnail_url, is_private), title, location, date, time, player_level, participants, passcode, status").filter("title", "ilike", "%" + title + "%")
    db.filter("player_level", "eq", level).filter("date", "gte", formatDateToString(date))
    if (location)
        db.filter("location", "ilike", "%" + location + "%")
    if (time)
        db.filter("time", "gte", time)
    const { data, error } = await db
    if (error)
        throw error
    const games: GameHeader[] = []
    data?.forEach(game => {
        games.push({ id: game.id, organizer: game.organizer, title: game.title, location: game.location, date: game.date, time: game.time, player_level: game.player_level, passcode: game.passcode, participants: game.participants, status: game.status })
    })
    return games
}

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
    const { data, error } = await supabase.from("games").select("*, organizer: organizer(uid, name, thumbnail_url, is_private)").match({ "id": id })
    if (error)
        throw error
    if (data)
        if (data.length > 0)
            return { id: id, organizer: data[0].organizer, title: data[0].title, description: data[0].description, location: data[0].location, date: data[0].date, time: data[0].time, player_level: data[0].player_level, passcode: data[0].passcode, participants: data[0].participants, max_players: data[0].max_players, min_players: data[0].min_players, custom_rules: data[0].custom_rules, requirements: data[0].requirements, status: data[0].status, region: data[0].region }
    throw new Error("Could not get game details")
}

export async function getGameWithPasscode(id: string, passcode: string): Promise<Game> {
    const { data, error } = await supabase.from("games").select("*, organizer: organizer(uid, name, thumbnail_url, is_private)").match({ "id": id, "passcode": passcode })
    if (error)
        throw error
    if (data)
        if (data.length > 0)
            return { id: id, organizer: data[0].organizer, title: data[0].title, description: data[0].description, location: data[0].location, date: data[0].date, time: data[0].time, player_level: data[0].player_level, passcode: passcode, participants: data[0].participants, max_players: data[0].max_players, min_players: data[0].min_players, custom_rules: data[0].custom_rules, requirements: data[0].requirements, status: data[0].status, region: data[0].region }
    throw new Error("Could not get game details")
}

export async function organizeGame(uid: string, title: string, description: string, location: string, date: Date, time: string, player_level: number, passcode: string | null, max_players: number | null, min_players: number | null, custom_rules: string | null, requirements: string | null) {
    const { data, error } = await supabase.from("games").insert({ organizer: uid, title: title, description: description, location: location, date: formatDateToString(date), time: time, player_level: player_level, passcode: passcode, max_players: max_players, min_players: min_players, custom_rules: custom_rules, requirements: requirements })
    if (error)
        throw error
    let { data: game_id } = await supabase.from("games").select("id").order('timestamp', { ascending: false }).eq('organizer', uid)
    await supabase.from("participants").insert({ game_id: game_id![0].id, uid: uid })
    return data
}

export async function updateGameDetail(game_id: string, title: string, description: string, location: string, date: Date, time: string, player_level: number, passcode: string | null, max_players: number | null, min_players: number | null, custom_rules: string | null, requirements: string | null) {
    const { data, error } = await supabase.from("games").update({ title: title, description: description, location: location, "date": formatDateToString(date), "time": time, player_level: player_level, passcode: passcode, max_players: max_players, min_players: min_players, custom_rules: custom_rules, requirements: requirements }).eq("id", game_id)
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
    const { data, error } = await supabase.from("participants").insert({ game_id: game_id, uid: uid })
    if (error)
        throw error
    let { data: participants } = await supabase.from("participants").select("uid").eq('game_id', game_id)
    await supabase.from("games").update({ participants: participants!.length + 1 })
    return data
}

export async function cancelRSVP(game_id: string, uid: string) {
    const { data, error } = await supabase.from("participants").delete().match({ "game_id": game_id, "uid": uid })
    if (error)
        throw error
    let { data: participants } = await supabase.from("participants").select("uid").eq('game_id', game_id)
    await supabase.from("games").update({ participants: participants!.length - 1 })
    return data
}

export async function getParticipants(game_id: string): Promise<SimpleProfile[]> {
    const { data, error } = await supabase.from("participants").select("player: uid(uid, name, thumbnail_url, position, is_private)").eq("game_id", game_id)
    if (error)
        throw error
    if (data)
        if (data.length > 0) {
            const participants: SimpleProfile[] = []
            data?.forEach((participant) => {
                participants.push({ uid: participant.player.uid, name: participant.player.name, thumbnail_url: participant.player.thumbnail_url, position: participant.player.position, is_private: participant.player.is_private })
            })
            return participants
        }
    throw new Error("Couldn't get participants")
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

export async function getChatMessages(game_id: string): Promise<Message[]> {
    const { data, error } = await supabase.from("game_chats").select("*, sender: sender(uid, name, thumbnail_url, is_private)").filter("game_id", "eq", game_id).order("timestamp", { ascending: true })
    if (error)
        throw error
    const messages: Message[] = []
    data?.forEach(message => {
        messages.push({ id: message.id, game_id: game_id, sender: message.sender, content: message.content, timestamp: new Date(message.timestamp) })
    })
    return messages
}

export async function sendChatMessage(game_id: string, uid: string, content: any) {
    const { data, error } = await supabase.from("game_chats").insert({ game_id: game_id, sender: uid, content: content })
    if (error)
        throw error
    return data
}

export async function deleteChatMessage(message_id: string) {
    const { data, error } = await supabase.from("game_chats").delete().match({ id: message_id })
    if (error)
        throw error
    return data
}