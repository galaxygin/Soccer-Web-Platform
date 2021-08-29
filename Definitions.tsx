export const appName = "Soccer Web Platform"

export const baseUrl = "http://localhost:3000"

export const landscapeFieldImgURI = "/assets/images/SoccerFieldLandscape.jpg"

/*
    The types are using snake case to obey database column names
*/

export type Player = {
    uid: string
    name: string
    bio: string
    thumbnail_url?: string
    header_url?: string
    local_area?: string
    position: string
    warning_score: number
    blocked_players?: Player[]
    last_online?: Date
    is_private: boolean
    region: string
}

export type SimpleProfile = {
    uid: string
    name: string
    thumbnail_url?: string
    position?: string
    is_private: boolean
}

export type PlayerMetaData = {
    uid: string
    name: string
    bio?: string
    thumbnail_url?: string
    is_private: boolean
}

export type Game = {
    id: string
    organizer: Player | SimpleProfile,
    title: string,
    description: string,
    location: string,
    date: Date
    time: Date
    player_level: number,
    passcode: string
    participants: number
    max_players: number
    min_players: number
    custom_rules: string | null
    requirements: string | null
    status: string | null
    region: string
}

export type GameMetaData = {
    id: string
    organizer: string
    title: string
    description: string
    passcode: boolean
}

export type GameHeader = {
    id: string
    organizer: Player | SimpleProfile
    title: string
    location: string
    date: Date
    time: Date
    player_level: number
    passcode: string | null
    participants: number
    status: string
}

export type Message = {
    id: string
    game_id: string
    sender: SimpleProfile
    content: any
    timestamp: Date
}

export type Manager = {
    uid: string,
    name: string,
    email: string,
    teamName: string,
    willPlayAsWell: boolean,
    position: string | null
    warning_score: number
}

export type Team = {
    id: string
    name: string,
    description: string,
    homeGround: string,
    manager: Manager,
    rules: string,
    requirements: string,
    openToPublic: boolean
    lookingPlayers: boolean
    blocked_players: Player[]
    trainingDates: string | null
    leagueDivision: string | null
}

export type Plan = {
    name: PlanName
    fee: PlanFee
    description: PlanDescription
}

export enum PlanName {
    player = "Player",
    manager = "Manager"
}

export enum PlanFee {
    player = 0,
    manager = 10
}

export enum PlanDescription {
    player = "Can join a game and organise (public?) game",
    manager = "Can create own team"
}

export type Region = {
    key: string
    value: string
    label: string
}

export const regions: Region[] = [
    { key: "australia", value: "au", label: "Australia" },
    { key: "japan", value: "jp", label: "日本" },
    { key: "class", value: "class", label: "Class base" }
]

export const getPlayerLevel = (level: number) => {
    switch (level) {
        case 1:
            return "Mid level"
        case 2:
            return "High level"
        case 3:
            return "Professional level"
        default:
            return "Anyone"
    }
}

export const getPlayerLevelJP = (level: number) => {
    switch (level) {
        case 1:
            return "普通"
        case 2:
            return "上級"
        case 3:
            return "プロレベル"
        default:
            return "誰でも"
    }
}