import { formatDateToString, getMondayOfTheWeek, getNextMonday } from "../../components/DateManager"
import { Tournament, TournamentHeader, TournammentMetaData } from "../../Definitions"
import { supabase } from "../../SupabaseManager"

export async function getTournaments(): Promise<TournamentHeader[]> {
    const { data, error } = await supabase.from("test_tournaments").select("id, organizer: organizer(uid, name, thumbnail_url, is_private), title, location, date, time, player_level, participants, passcode, status").filter("date", "gte", formatDateToString(getMondayOfTheWeek())).filter("date", "lt", formatDateToString(getNextMonday())).order("date", { ascending: true }).order("time", { ascending: true })
    if (error)
        throw error
    const tournaments: TournamentHeader[] = []
    data?.forEach(tournament => {
        tournaments.push({ id: tournament.id, organizer: tournament.organizer, title: tournament.title, location: tournament.location, date: tournament.date, time: tournament.time, player_level: tournament.player_level, passcode: tournament.passcode, status: tournament.status })
    })
    return tournaments
}

export async function getTournamentMetaData(id: string): Promise<TournammentMetaData> {
    const { data, error } = await supabase.from("test_tournaments").select("organizer, title, description, passcode").match({ "id": id })
    if (error)
        throw error
    if (data)
        if (data.length > 0)
            return { id: id, organizer: data[0].organizer, title: data[0].title, description: data[0].description, passcode: (data[0].passcode) ? true : false }
    throw new Error("Could not get tournament details")
}

export async function getTournament(id: string): Promise<Tournament> {
    const { data, error } = await supabase.from("test_tournaments").select("*, organizer: organizer(uid, name, thumbnail_url, is_private)").match({ "id": id })
    if (error)
        throw error
    if (data)
        if (data.length > 0)
            return { id: id, organizer: data[0].organizer, name: data[0].name, description: data[0].description, requirements: data[0].requirements, rules: data[0].rules, date: data[0].date, time: data[0].time, location: data[0].location, region: data[0].region, level: data[0].level, players_per_team: data[0].players_per_team, fee_per_player: data[0].fee_per_player, max_teams: data[0].max_teams, start_from: data[0].start_from, winner_prize: data[0].winner_prize, header_url: data[0].header_url, passcode: data[0].passcode, status: data[0].status, timestamp: data[0].timestamp }
    throw new Error("Could not get tournament details")
}

export async function getTournamentWithPasscode(id: string, passcode: string): Promise<Tournament> {
    const { data, error } = await supabase.from("test_tournaments").select("*, organizer: organizer(uid, name, thumbnail_url, is_private)").match({ "id": id, "passcode": passcode })
    if (error)
        throw error
    if (data)
        if (data.length > 0)
            return { id: id, organizer: data[0].organizer, name: data[0].name, description: data[0].description, requirements: data[0].requirements, rules: data[0].rules, date: data[0].date, time: data[0].time, location: data[0].location, region: data[0].region, level: data[0].level, players_per_team: data[0].players_per_team, fee_per_player: data[0].fee_per_player, max_teams: data[0].max_teams, start_from: data[0].start_from, winner_prize: data[0].winner_prize, header_url: data[0].header_url, passcode: passcode, status: data[0].status, timestamp: data[0].timestamp }
    throw new Error("Could not get tournament details")
}