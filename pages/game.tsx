import DateFnsUtils from '@date-io/date-fns'
import { CircularProgress, Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Snackbar, IconButton, MenuItem } from '@material-ui/core'
import { Typography } from '@material-ui/core'
import { Edit, LockTwoTone } from '@material-ui/icons'
import Alert from '@material-ui/lab/Alert'
import { KeyboardDatePicker, KeyboardTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers'
import Image from 'next/image'
import { useRouter } from 'next/router'
import React, { useState, useEffect } from 'react'
import { useCookies } from 'react-cookie'
import { isMobile } from 'react-device-detect'
import { cancelRSVP, checkIsAlreadyJoining, getGame, getGameMetaData, getGameWithPasscode, joinAGame, updateGameDetail } from '../api/request/GameRequest'
import { removeSecondsFromTime } from '../components/DateManager'
import { Game, GameMetaData, getPlayerLevel } from '../Definitions'
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
    metadata: GameMetaData | null
}

export default function GamePage({ metadata }: props) {
    const styles = useStyles()
    const router = useRouter()
    const [game, setGame] = useState<Game | null>(null)
    const [width, setWidth] = useState(0)
    const [cookies, setCookie, removeCookie] = useCookies(['uid'])
    const [isJoining, setJoining] = useState(false)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    const [showPassDialog, openPassDialog] = useState(false)
    const [passcode, setPasscode] = useState<string | null>(null)
    const [authenticating, setAuthenticating] = useState(false)
    const [passErrorMsg, setPassErrorMsg] = useState<string | null>(null)

    const [showJoinConfirmDialog, openJoinConfirmDialog] = useState(false)
    const [joinLoading, setJoinLoading] = useState(false)
    const [joinError, setJoinError] = useState(null)

    const [showEditDialog, openEditDialog] = useState(false)
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [location, setLocation] = useState("")
    const [date, setDate] = useState<Date | null>(null)
    const [time, setTime] = useState<Date | null>(null)
    const [playerLevel, setPlayerLevel] = useState(0)
    const [maxPlayers, setMaxPlayers] = useState<number | null>(null)
    const [minPlayers, setMinPlayers] = useState<number | null>(null)
    const [customRules, setCustomRules] = useState<string | null>(null)
    const [requirements, setRequirements] = useState<string | null>(null)
    const [editLoading, setEditLoading] = useState(false)
    const [editError, setEditError] = useState(null)

    const [showSnackbar, openSnackbar] = useState(false)
    const [snackMsg, setSnackMsg] = useState("")

    useEffect(() => {
        setWidth(window.innerWidth)
        if (metadata) {
            if (metadata.organizer == cookies.uid) {
                reloadDetails()
                return
            }
            checkIsAlreadyJoining(metadata.id, cookies.uid).then(result => {
                setJoining(result)
                if (result)
                    reloadDetails()
                else
                    if (metadata.passcode)
                        openPassDialog(true)
                    else
                        reloadDetails()
            }).catch(error => setErrorMsg(error.message))
            setWidth(window.innerWidth)
        }
    }, [])

    function reloadDetails() {
        getGame(metadata!.id).then(game => {
            setGame(game)
            setTitle(game.title)
            setDescription(game.description)
            setLocation(game.location)
            setDate(game.date)
            setTime(game.time)
            setPlayerLevel(game.playerLevel)
            setPasscode(game.passcode)
            setMaxPlayers(game.maxPlayers)
            setMinPlayers(game.minPlayers)
            setCustomRules(game.customRules)
            setRequirements(game.requirements)
        }).catch(error => setErrorMsg(error.message)).finally(() => setLoading(false))
    }

    function renderByStatus() {
        if (game?.organizer.uid == cookies.uid)
            return null
        if (game?.status == "cancelled")
            return <Typography variant="h5" style={{ color: "red" }}>This game has been cancelled</Typography>
        if (isJoining)
            return <Button style={{ backgroundColor: "white", color: "red", width: "80%", borderColor: "red", borderWidth: 1, borderStyle: "solid" }} onClick={() => {
                setJoinLoading(true)
                cancelRSVP(game!.id, cookies.uid).then(() => {
                    setJoining(false)
                    setJoinLoading(false)
                })
            }}>
                Cancel commission
            </Button>
        if (game?.participants == game?.maxPlayers)
            return <Typography style={{ color: "redActu" }}>The number of the participants has exceeded the max number of players</Typography>
        return <Button style={{ backgroundColor: "white", color: "red", width: "80%", borderColor: "red", borderWidth: 1, borderStyle: "solid" }} onClick={() => openJoinConfirmDialog(true)}>
            Join this game
        </Button>
    }

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
                                    setJoining(true)
                                    openJoinConfirmDialog(false)
                                    setSnackMsg("Joined the game successfully")
                                    openSnackbar(true)
                                }).catch(error => setJoinError(error.message)).finally(() => setJoinLoading(false))
                            }}>Join</Button>}
                        </DialogActions>
                    </Dialog>
                    <Dialog open={showEditDialog} onClose={() => openEditDialog(false)} fullScreen>
                        <DialogTitle>Update game details</DialogTitle>
                        <DialogContent>
                            {(editError) ? <Alert severity="error">{editError}</Alert> : null}
                            <TextField label="Title" variant="outlined" className={styles.formTextField} onChange={e => setTitle(e.target.value)} value={title} fullWidth />
                            <TextField label="Description" variant="outlined" className={styles.formTextField} onChange={e => setDescription(e.target.value)} value={description} fullWidth multiline minRows={4} />
                            <TextField label="Location" variant="outlined" className={styles.formTextField} onChange={e => setLocation(e.target.value)} value={location} fullWidth />
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <KeyboardDatePicker
                                    disableToolbar
                                    variant="inline"
                                    format="yyyy-MM-dd"
                                    margin="normal"
                                    id="date-picker-inline"
                                    label="Date"
                                    value={date}
                                    onChange={(date: Date | null) => setDate(date!)}
                                    KeyboardButtonProps={{
                                        'aria-label': 'change date',
                                    }}
                                />
                            </MuiPickersUtilsProvider>
                            <TextField label="Time" variant="outlined" className={styles.formTextField} onChange={e => setTime(new Date("1970-01-01 " + e.target.value))} defaultValue={time} type="time" />
                            <TextField label="Player level" variant="outlined" className={styles.formTextField} onChange={e => setPlayerLevel(parseInt(e.target.value))} value={playerLevel} fullWidth select>
                                <MenuItem key={0} value={0}>Anyone</MenuItem>
                                <MenuItem key={1} value={1}>Mid level</MenuItem>
                                <MenuItem key={2} value={2}>High level</MenuItem>
                                <MenuItem key={3} value={3}>Professional level</MenuItem>
                            </TextField>
                            <Typography variant="h5" style={{ marginTop: 16 }}>
                                Optional (Leave it blank to disable it)
                            </Typography>
                            <TextField label="Passcode (To make it private)" variant="outlined" className={styles.formTextField} onChange={e => setPasscode(e.target.value)} value={passcode} fullWidth />
                            <TextField label="Max players" variant="outlined" className={styles.formTextField} onChange={e => setMaxPlayers(parseInt(e.target.value))} value={maxPlayers} fullWidth type="number" />
                            <TextField label="Min players" variant="outlined" className={styles.formTextField} onChange={e => setMinPlayers(parseInt(e.target.value))} value={minPlayers} fullWidth type="number" />
                            <TextField label="Custom rules" variant="outlined" className={styles.formTextField} onChange={e => setCustomRules(e.target.value)} value={customRules} fullWidth multiline minRows={4} />
                            <TextField label="Requirements" variant="outlined" className={styles.formTextField} onChange={e => setRequirements(e.target.value)} value={requirements} fullWidth multiline minRows={4} />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => openEditDialog(false)}>Cancel</Button>
                            <div style={{ flexGrow: 1 }} />
                            {(editLoading) ? <CircularProgress style={{ color: backgroundTheme }} /> : <Button style={{ backgroundColor: "red", color: "white" }} onClick={() => {
                                setEditLoading(true)
                                updateGameDetail(game.id, title, description, location, date!, time!, playerLevel, passcode, maxPlayers, minPlayers, customRules, requirements).then(() => {
                                    openEditDialog(false)
                                    setTitle("")
                                    setDescription("")
                                    setLocation("")
                                    setPlayerLevel(0)
                                    setPasscode(null)
                                    setMaxPlayers(null)
                                    setMinPlayers(null)
                                    setCustomRules(null)
                                    setRequirements(null)
                                    setSnackMsg("The game details updated successfully")
                                    reloadDetails()
                                    openSnackbar(true)
                                }).catch(error => setEditError(error.message)).finally(() => setEditLoading(false))
                            }}>Update</Button>}
                        </DialogActions>
                    </Dialog>
                    <Image src={"/assets/images/SoccerFieldLandscape.jpg"} width={width * 0.5} height={350} />
                    <div style={{ backgroundColor: "#FFFFFF", height: "100%", borderColor: "white", borderWidth: 1, borderStyle: "solid" }}>
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", flexWrap: "nowrap", padding: 8 }}>
                            <Typography variant="h5" style={{ color: darkerTextColor, fontWeight: "bold", flex: 1, overflow: "hidden" }}>
                                {game.title}
                            </Typography>
                            {(game.organizer.uid == cookies.uid) ? <IconButton style={{ backgroundColor: backgroundTheme, width: 48, height: 48 }} onClick={() => openEditDialog(true)}>
                                <Edit style={{ color: "white" }} />
                            </IconButton> : null}
                            {(game.passcode) ? <LockTwoTone style={{ color: "gray", width: 36, height: 36 }} /> : null}
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
                                {renderByStatus()}
                            </div>
                        </Typography>
                    </div>
                    <Snackbar open={showSnackbar} autoHideDuration={6000} onClose={() => openSnackbar(false)}>
                        <Alert onClose={() => openSnackbar(false)} severity="success">{snackMsg}</Alert>
                    </Snackbar>
                </div >
            )
        } else {
            if (loading)
                return <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <CircularProgress style={{ color: backgroundTheme }} />
                </div>
            else
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
                                    getGameWithPasscode(router.query.id as string, passcode!).then(game => {
                                        if (game) {
                                            setGame(game)
                                            openPassDialog(false)
                                            setLoading(false)
                                        } else {
                                            setPassErrorMsg("Could not get game detail. Check the passcode or network.")
                                        }
                                    }).catch(error => setPassErrorMsg(error.message)).finally(() => setAuthenticating(false))
                                }}>Proceed</Button>}
                            </DialogActions>
                        </Dialog>
                        <Typography style={{ color: darkerTextColor }}>
                            {(errorMsg) ? <Alert severity="error">{errorMsg}</Alert> : null}<br />
                            Couldn't get game details.
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
    if (id) {
        var data = null
        await getGameMetaData(id).then(metadata => {
            data = metadata
        }).catch(error => console.log(error.message))
        return { props: { metadata: data } }
    } else {
        return { props: { metadata: null } }
    }
}