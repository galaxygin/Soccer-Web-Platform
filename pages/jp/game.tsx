import { CircularProgress, Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Snackbar, IconButton, AppBar, Toolbar, Typography, List, ListItem } from '@material-ui/core'
import { Close, Edit, LockTwoTone, SendTwoTone, AccountCircle, DeleteTwoTone } from '@material-ui/icons'
import Alert from '@material-ui/lab/Alert'
import { RealtimeSubscription } from '@supabase/realtime-js'
import Image from 'next/image'
import { useRouter } from 'next/router'
import React, { useState, useEffect } from 'react'
import { useCookies } from 'react-cookie'
import { isMobile } from 'react-device-detect'
import { cancelRSVP, checkIsAlreadyJoining, getGame, getGameMetaData, getGameWithPasscode, joinAGame, getChatMessages, sendChatMessage, deleteChatMessage } from '../../api/request/GameTestRequest'
import { getSimpleProfile } from '../../api/request/UserRequest'
import { formatDateToString, formatTimeToString, removeSecondsFromTime } from '../../components/DateManager'
import OrganizeFormAU from '../../components/OrganizeForm'
import { Game, GameMetaData, getPlayerLevelJP, landscapeFieldImgURI, Message } from '../../Definitions'
import { backgroundTheme, borderColor, darkerTextColor, themeColor, useStyles } from '../../public/assets/styles/styles.web'
import { supabase } from '../../SupabaseManager'
import Header from '../Header'
import PageBase from '../PageBase'
import ParticipantsView from './participants'

const sample_game = {
    id: '1',
    organizer: "Perra",
    title: "Perra game",
    description: "Setumei",
    location: "Sydney",
    date: new Date(),
    time: new Date(),
    player_level: 0,
    passcode: null,
    max_players: null,
    min_players: null,
    custom_rules: "No hands",
    requirements: null,
    participants: 1
}

interface props {
    metadata: GameMetaData | null
}

export default function GameView({ metadata }: props) {
    const styles = useStyles()
    const router = useRouter()
    const [game, setGame] = useState<Game | null>(null)
    const [width, setWidth] = useState(0)
    const [cookies, setCookie, removeCookie] = useCookies(['uid'])
    const [isJoining, setJoining] = useState(false)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    const [showPassDialog, openPassDialog] = useState(false)
    const [passcode, setPasscode] = useState<string>("")
    const [authenticating, setAuthenticating] = useState(false)
    const [passErrorMsg, setPassErrorMsg] = useState<string | null>(null)

    const [showJoinConfirmDialog, openJoinConfirmDialog] = useState(false)
    const [joinLoading, setJoinLoading] = useState(false)
    const [joinError, setJoinError] = useState(null)

    const [showEditDialog, openEditDialog] = useState(false)

    const [showParticipants, openParticipants] = useState(false)

    const [message, setMessage] = useState("")
    const [messages, setMessages] = useState<Message[]>([])
    const [sending, setSending] = useState(false)

    const [showSnackbar, openSnackbar] = useState(false)
    const [snackMsg, setSnackMsg] = useState("")

    useEffect(() => {
        setWidth(window.innerWidth)
        if (metadata) {
            if (metadata.organizer == cookies.uid) {
                reloadDetails()
                loadChat()
                return
            }
            checkIsAlreadyJoining(metadata.id, cookies.uid).then(result => {
                setJoining(result)
                if (result) {
                    reloadDetails()
                    loadChat()
                } else
                    if (metadata.passcode) {
                        setLoading(false)
                        openPassDialog(true)
                    } else {
                        reloadDetails()
                        loadChat()
                    }
            }).catch(error => setErrorMsg(error.message))
            setWidth(window.innerWidth)
        } else {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        var chatSubscription: RealtimeSubscription
        if (metadata) {
            chatSubscription = supabase.from('game_chats:game_id=eq.' + metadata!.id)
                .on('INSERT', payload => {
                    getSimpleProfile(payload.new.sender).then(user => setMessages(prevState => [...prevState, { id: payload.new.id, game_id: payload.new.game_id, sender: { uid: user.uid, name: user.name, thumbnail_url: user.thumbnail_url }, content: payload.new.content, timestamp: new Date(payload.new.timestamp) }]))
                }).on('DELETE', payload => {
                    setMessages(prevState => prevState.filter(message => message.id !== payload.old.id))
                }).subscribe()
        }
        return () => {
            if (chatSubscription)
                chatSubscription.unsubscribe()
        }
    }, [])

    function reloadDetails() {
        setLoading(true)
        getGame(metadata!.id).then(game => {
            setGame(game)
        }).catch(error => setErrorMsg(error.message)).finally(() => setLoading(false))
    }

    function loadChat() {
        getChatMessages(metadata!.id).then(messages => setMessages(messages))
    }

    function renderByStatus() {
        if (game?.status == "cancelled")
            return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 16 }}>
                <Typography variant="h5" style={{ color: "red" }}>This game has been cancelled</Typography>
            </div>
        if (game?.organizer.uid == cookies.uid)
            return null
        if (new Date() > new Date(game?.date + " " + game?.time))
            return null
        if (isJoining)
            return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 16 }}>
                <Button style={{ backgroundColor: "white", color: "red", width: "80%", borderColor: "red", borderWidth: 1, borderStyle: "solid" }} onClick={() => {
                    setJoinLoading(true)
                    cancelRSVP(game!.id, cookies.uid).then(() => {
                        setJoining(false)
                        setJoinLoading(false)
                    })
                }}>
                    Cancel commission
                </Button>
            </div>
        if (game?.participants == game?.max_players)
            return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 16 }}>
                <Typography style={{ color: "redActu" }}>The number of the participants has exceeded the max number of players</Typography>
            </div>
        return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 16 }}>
            <Button style={{ backgroundColor: "white", color: "red", width: "80%", borderColor: "red", borderWidth: 1, borderStyle: "solid" }} onClick={() => openJoinConfirmDialog(true)}>
                Join this game
            </Button>
        </div>
    }

    function content() {
        if (game) {
            return (
                <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <Dialog open={showJoinConfirmDialog} fullWidth>
                        <DialogTitle>確認</DialogTitle>
                        <DialogContent>
                            このゲームに参加しますか?<br />
                            このゲームに参加する事で、ゲームのルールと要件に同意した事になります。<br />
                            また、参加中の以下の行為を行うと警告スコアが増加し段階的な規制が行われます。<br />
                            ・姿を見せない<br />
                            ・暴力<br />
                            ・ハラスメント<br />
                            ・差別<br />
                            ・ルールに従わない<br />
                            ・その他、主催者が問題と認識した行為<br />
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
                            }}>参加する</Button>}
                        </DialogActions>
                    </Dialog>
                    <OrganizeFormAU show={showEditDialog} uid={cookies.uid} game_id={game.id} _title={game.title} _description={game.description} _location={game.location} _date={new Date(game.date)} _time={game.time.toString()} _playerLevel={game.player_level} _passcode={passcode} _maxPlayers={game.max_players} _minPlayers={game.min_players} _customRules={game.custom_rules} _requirements={game.requirements} editing posted={() => {
                        openEditDialog(false)
                        setSnackMsg("The game details updated successfully")
                        reloadDetails()
                        openSnackbar(true)
                    }} onClose={() => openEditDialog(false)} onCancelled={() => {
                        setGame(prevState => ({ ...prevState!, status: "cancelled" }))
                        openEditDialog(false)
                    }} />
                    <Dialog open={showParticipants} onClick={() => openParticipants(false)} fullScreen>
                        <AppBar style={{ position: "relative" }}>
                            <Toolbar>
                                <IconButton edge="start" color="inherit" onClick={() => openEditDialog(false)} aria-label="close">
                                    <Close />
                                </IconButton>
                                <Typography variant="h6" style={{ flex: 1 }}>
                                    参加者
                                </Typography>
                            </Toolbar>
                        </AppBar>
                        <ParticipantsView game_id={metadata!.id} />
                    </Dialog>
                    <Image src={landscapeFieldImgURI} width={width * 0.5} height={300} />
                    <Typography component={"div"} style={{ backgroundColor: "#FFFFFF", borderColor: borderColor, borderWidth: 1, borderStyle: "solid" }}>
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", flexWrap: "nowrap", paddingLeft: 8, paddingTop: 8 }}>
                            <Typography variant="h4" style={{ color: darkerTextColor, fontWeight: "bold", flex: 1, overflow: "hidden" }}>
                                {game.title}
                            </Typography>
                            {(game.passcode) ? <LockTwoTone style={{ color: "gray", width: 36, height: 36 }} /> : null}
                            {(game.organizer.uid == cookies.uid && game.status != "cancelled" && new Date() < new Date(game?.date + " " + game?.time)) ? <IconButton style={{ backgroundColor: backgroundTheme, width: 48, height: 48, marginRight: 16 }} onClick={() => openEditDialog(true)}>
                                <Edit style={{ color: "white" }} />
                            </IconButton> : null}
                        </div>
                        <Typography component={"div"} style={{ padding: 8, marginTop: 8 }}>
                            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", marginBottom: 16 }} onClick={() => router.push({ pathname: "/jp/player", query: { uid: game.organizer.uid } })}>
                                {(game.organizer.thumbnail_url) ? <img src={game.organizer.thumbnail_url} width={48} height={48} style={{ borderRadius: 24 }} /> : <AccountCircle style={{ width: 48, height: 48, borderRadius: 24 }} />}
                                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", color: darkerTextColor, marginLeft: 8, height: 48 }}>
                                    <div style={{ fontWeight: "bold", fontSize: 20, height: 30 }}>
                                        {game.organizer.name}
                                    </div>
                                    主催者
                                </div>
                            </div>
                            {game.description}<br />
                            場所: {game.location}<br />
                            日時: {game.date + " " + removeSecondsFromTime(game.time)}<br />
                            レベル: {getPlayerLevelJP(game.player_level)}<br />
                            {(game.max_players) ? <>最大人数: {game.max_players}<br /></> : null}
                            {(isMobile) ? <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 16 }}>
                                <Button style={{ backgroundColor: "white", color: backgroundTheme, width: "80%", borderColor: backgroundTheme, borderWidth: 1, borderStyle: "solid" }} onClick={() => openParticipants(true)}>
                                    参加者 ({game.participants})
                                </Button>
                            </div> : null}
                            {renderByStatus()}
                        </Typography>
                    </Typography>
                    <div>
                        <div style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
                            <TextField label="参加者にメッセージを送る" variant="outlined" className={styles.formTextField} onChange={e => setMessage(e.target.value)} value={message} fullWidth style={{ marginTop: 0 }} />
                            {(sending) ? <CircularProgress /> : <IconButton onClick={() => {
                                setSending(true)
                                sendChatMessage(game.id, cookies.uid, message).then(() => { setMessage(""); }).catch(error => console.log(error.message)).finally(() => setSending(false))
                            }}>
                                <SendTwoTone style={{ color: themeColor }} />
                            </IconButton>}
                        </div>
                        <List style={{ backgroundColor: "whitesmoke", flexGrow: 1, maxHeight: 300, overflow: "scroll" }}>
                            {messages.map(message => (
                                <ListItem style={{ backgroundColor: "whitesmoke" }} key={message.id}>
                                    <Typography component={"div"} style={{ display: "flex", flexDirection: "row", alignItems: "center", width: "100%" }}>
                                        {(message.sender.thumbnail_url) ? <img src={message.sender.thumbnail_url} width={48} height={48} style={{ borderRadius: 24 }} /> : <AccountCircle style={{ width: 48, height: 48, borderRadius: 24 }} />}
                                        <div style={{ display: "flex", flexDirection: "column", color: darkerTextColor, marginLeft: 16, width: "100%" }}>
                                            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", width: "100%", maxHeight: 20 }}>
                                                <Typography component={"div"} style={{ fontWeight: "bold", marginRight: 8, flex: 1 }}>
                                                    {message.sender.name}
                                                </Typography>
                                                {formatDateToString(message.timestamp) + " " + formatTimeToString(message.timestamp)}
                                                {(message.sender.uid == cookies.uid) ? <IconButton onClick={() => deleteChatMessage(message.id)}>
                                                    <DeleteTwoTone />
                                                </IconButton> : null}
                                            </div>
                                            {message.content}
                                        </div>
                                    </Typography>
                                </ListItem>
                            ))}
                        </List>
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
                            <DialogTitle>パスコードが必要です</DialogTitle>
                            <DialogContent>
                                このゲームの詳細を閲覧する為にはパスコードが必要です。<br />
                                提供されたパスコードを入力してください。<br /><br />
                                {(passErrorMsg) ? <Alert severity="error">{passErrorMsg}</Alert> : null}<br />
                                <TextField label="Passcode" variant="outlined" className={styles.formTextField} onChange={e => setPasscode(e.target.value)} value={passcode} fullWidth />
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => router.back()}>戻る</Button>
                                <div style={{ flexGrow: 1 }} />
                                {(authenticating) ? <CircularProgress /> : <Button style={{ backgroundColor: "red", color: "white" }} onClick={() => {
                                    setAuthenticating(true)
                                    getGameWithPasscode(router.query.id as string, passcode!).then(game => {
                                        if (game) {
                                            setGame(game)
                                            openPassDialog(false)
                                            loadChat()
                                            setLoading(false)
                                        } else {
                                            setPassErrorMsg("Could not get game detail. Check the passcode or network.")
                                        }
                                    }).catch(error => setPassErrorMsg(error.message)).finally(() => setAuthenticating(false))
                                }}>進む</Button>}
                            </DialogActions>
                        </Dialog>
                        <Typography component={"div"} style={{ color: darkerTextColor }}>
                            {(errorMsg) ? <Alert severity="error">{errorMsg}</Alert> : null}<br />
                            ゲーム詳細の取得に失敗しました。
                        </Typography>
                    </div >
                )
        }
    }

    if (isMobile) {
        return <PageBase content={content()} header={<Header title={(game) ? game.title : "Private or couldn't get title"} description={(game) ? game.description : "Private or couldn't get description"} />} region={"jp"} />
    } else {
        return <PageBase content={content()} detailView={(game) ? <ParticipantsView game_id={game.id} /> : <div />} header={<Header title={(game) ? game.title : "Private or couldn't get title"} description={(game) ? game.description : "Private or couldn't get description"} />} region={"jp"} />
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