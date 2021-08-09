export const appName = "Soccer Web Platform"

export type Player = {
    name: string,
    email: string,
    localArea: string | null,
    position: string | null,
    warningScore: number
}

export type Game = {
    organiser: string,
    title: string,
    description: string,
    location: string,
    dateTime: Date | any
    playerLevel: string,
    visibility: Visibility,
    maxPlayers: number | null
    minimumPlayers: number | null
    customRules: string | null
    requirements: string | null
    blockedPlayers: Player[]
}

export enum Visibility {
    public,
    private
}

export type Manager = {
    name: string,
    email: string,
    teamName: string,
    willPlayAsWell: boolean,
    position: string | null
    warningScore: number
}

export type Team = {
    name: string,
    description: string,
    homeGround: string,
    manager: Manager,
    rules: string,
    requirements: string,
    visibility: Visibility
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

enum PlanName {
    player = "Player",
    manager = "Manager"
}

enum PlanFee {
    player = 0,
    manager = 10
}

enum PlanDescription {
    player = "Can join a game and organise (public?) game",
    manager = "Can create own team"
}