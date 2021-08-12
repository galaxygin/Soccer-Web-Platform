export const appName = "Soccer Web Platform"

export type Player = {
    uid: string,
    name: string,
    bio: string
    thumbnailUrl: string | null,
    localArea: string | null,
    position: string,
    warningScore: number
    blockedPlayers: Player[] | null,
    lastOnline: Date | any
}

export type Game = {
    id: string
    organizer: Player,
    title: string,
    description: string,
    location: string,
    date: Date
    time: Date
    playerLevel: number,
    passcode: string | null
    participants: number
    maxPlayers: number | null
    minPlayers: number | null
    customRules: string | null
    requirements: string | null
}

export type Manager = {
    uid: string,
    name: string,
    email: string,
    teamName: string,
    willPlayAsWell: boolean,
    position: string | null
    warningScore: number
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
    blockedPlayers: Player[]
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