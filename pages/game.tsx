import { CircularProgress, Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Snackbar } from '@material-ui/core'
import { Typography } from '@material-ui/core'
import { LockTwoTone } from '@material-ui/icons'
import Alert from '@material-ui/lab/Alert'
import Image from 'next/image'
import { useRouter } from 'next/router'
import React, { useState, useEffect } from 'react'
import { useCookies } from 'react-cookie'
import { isMobile } from 'react-device-detect'
import { getGame, getGameWithPasscode, joinAGame } from '../api/request/GameRequest'
import { removeSecondsFromTime } from '../components/DateManager'
import { Game, getPlayerLevel } from '../Definitions'
import { backgroundTheme, darkerTextColor, defaultTheme, useStyles } from '../public/assets/styles/styles.web'
import Header from './Header'
import PageBase from './PageBase'
import Participants from './participants'

const sample_game = {
    id: '1',
    organizer: "Perra",
    title: "Perra game",
    description: "Setumei",
    location: "Sydney",
    date: new Date(),
    time: new Date(),
    playerLevel: 0,
    passcode: null,
    maxPlayers: null,
    minPlayers: null,
    customRules: "No hands",
    requirements: null,
    participants: 1
}

interface props {
    gameDetail: Game | null,
    needPasscode: boolean
}

export default function GamePage({ gameDetail, needPasscode }: props) {
    const styles = useStyles()
    const router = useRouter()
    const [game, setGame] = useState<Game | null>(gameDetail)
    const [width, setWidth] = useState(0)
    const [cookies, setCookie, removeCookie] = useCookies(['uid'])
    const [showPassDialog, openPassDialog] = useState(needPasscode)
    const [passcode, setPasscode] = useState("")
    const [authenticating, setAuthenticating] = useState(false)
    const [passErrorMsg, setPassErrorMsg] = useState<string | null>(null)

    const [showJoinConfirmDialog, openJoinConfirmDialog] = useState(false)
    const [joinLoading, setJoinLoading] = useState(false)
    const [joinError, setJoinError] = useState(null)
    const [showSnackbar, openSnackbar] = useState(false)

    useEffect(() => {
        setWidth(window.innerWidth)
    }, [])

    function content() {
        if (game) {
            return (
                <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <Dialog open={showJoinConfirmDialog} fullWidth>
                        <DialogTitle>Consent</DialogTitle>
                        <DialogContent>
                            Do you want to join this game?<br />
                            By joining this game, you must follow the rules and requirement of the game.<br />
                            Also, if you do any of the following during the game, you'll get warning score that gives you step by step restrictions<br />
                            ・No show<br />
                            ・Violence<br />
                            ・Harrassment<br />
                            ・Racism<br />
                            ・Breaching the rules<br />
                            {(joinError) ? <Alert severity="error">{joinError}</Alert> : null}<br />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => openJoinConfirmDialog(false)}>Go back</Button>
                            <div style={{ flexGrow: 1 }} />
                            {(joinLoading) ? <CircularProgress /> : <Button style={{ backgroundColor: "red", color: "white" }} onClick={() => {
                                setJoinLoading(true)
                                joinAGame(game.id, cookies.uid).then(() => {
                                    openJoinConfirmDialog(false)
                                    openSnackbar(true)
                                }).catch(error => setJoinError(error.message)).finally(() => setJoinLoading(false))
                            }}>Join</Button>}
                        </DialogActions>
                    </Dialog>
                    <Image src={"/assets/images/SoccerFieldLandscape.jpg"} width={width * 0.5} height={350} />
                    <div style={{ backgroundColor: defaultTheme, height: "100%", borderColor: "white", borderWidth: 1, borderStyle: "solid" }}>
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", flexWrap: "nowrap", padding: 8 }}>
                            <Typography variant="h5" style={{ color: darkerTextColor, fontWeight: "bold", flex: 1, overflow: "hidden" }}>
                                {game.title}
                            </Typography>
                            {(needPasscode) ? <LockTwoTone style={{ color: "gray", width: 36, height: 36 }} /> : null}
                        </div>
                        <Typography style={{ color: darkerTextColor, padding: 8 }}>
                            Organiser: {game.organizer.name}<br />
                            Description:<br />
                            {game.description}<br />
                            Location: {game.location}<br />
                            Date: {game.date + " " + removeSecondsFromTime(game.time)}<br />
                            Level: {getPlayerLevel(game.playerLevel)}<br />
                            {(game.maxPlayers) ? <>Max players: {game.maxPlayers}</> : null}<br />
                            {(isMobile) ? <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 16 }}>
                                <Button style={{ backgroundColor: "white", color: backgroundTheme, width: "80%", borderColor: backgroundTheme, borderWidth: 1, borderStyle: "solid" }} onClick={() => router.push({ pathname: "participants", query: { id: router.query.id } })}>
                                    Current players ({game.participants})
                                </Button>
                            </div> : null}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 16 }}>
                                <Button style={{ backgroundColor: "white", color: "red", width: "80%", borderColor: "red", borderWidth: 1, borderStyle: "solid" }} onClick={() => openJoinConfirmDialog(true)}>
                                    Join this game
                                </Button>
                            </div>
                        </Typography>
                    </div>
                    <Snackbar open={showSnackbar} autoHideDuration={6000} onClose={() => openSnackbar(false)}>
                        <Alert onClose={() => openSnackbar(false)} severity="success">Joined the game successfully</Alert>
                    </Snackbar>
                </div >
            )
        } else {
            return (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Dialog open={showPassDialog} fullScreen>
                        <DialogTitle>Passcode required</DialogTitle>
                        <DialogContent>
                            This game requires passcode to see the details.<br />
                            Please enter the passcode you are provided.<br /><br />
                            {(passErrorMsg) ? <Alert severity="error">{passErrorMsg}</Alert> : null}<br />
                            <TextField label="Passcode" variant="outlined" className={styles.formTextField} onChange={e => setPasscode(e.target.value)} value={passcode} fullWidth />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => router.back()}>Go back</Button>
                            <div style={{ flexGrow: 1 }} />
                            {(authenticating) ? <CircularProgress /> : <Button style={{ backgroundColor: "red", color: "white" }} onClick={() => {
                                setAuthenticating(true)
                                getGameWithPasscode(router.query.id as string, passcode).then(game => {
                                    if (game) {
                                        setGame(game)
                                        openPassDialog(false)
                                    } else {
                                        setPassErrorMsg("Could not get game detail. Check the passcode or network.")
                                    }
                                }).catch(error => setPassErrorMsg(error.message)).finally(() => setAuthenticating(false))
                            }}>Proceed</Button>}
                        </DialogActions>
                    </Dialog>
                    <Typography style={{ color: darkerTextColor }}>
                        Game not found. It maybe deleted
                    </Typography>
                </div >
            )
        }
    }

    if (isMobile) {
        return <PageBase content={content()} header={<Header title={(game) ? game.title : "Private or couldn't get title"} description={(game) ? game.description : "Private or couldn't get description"} />} />
    } else {
        return <PageBase content={content()} detailView={(game) ? <Participants game_id={game.id} /> : <div />} header={<Header title={(game) ? game.title : "Private or couldn't get title"} description={(game) ? game.description : "Private or couldn't get description"} />} />
    }
}

export async function getServerSideProps(context: any) {
    const { id } = context.query
    const { needPasscode } = context.query
    if (id) {
        var data = null
        if (needPasscode)
            return { props: { gameDetail: data, needPasscode: true } }
        await getGame(id).then(game => {
            data = game
        })
        return { props: { gameDetail: data, needPasscode: false } }
    } else {
        return { props: { gameDetail: null, needPasscode: false } }
    }
}