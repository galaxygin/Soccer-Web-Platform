import { CircularProgress, Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Snackbar, IconButton, AppBar, Toolbar, Typography, List, ListItem } from '@material-ui/core'
import { Close, Edit, LockTwoTone, SendTwoTone, AccountCircle, DeleteTwoTone } from '@material-ui/icons'
import Alert from '@material-ui/lab/Alert'
import { RealtimeSubscription } from '@supabase/realtime-js'
import { User } from '@supabase/supabase-js'
import Image from 'next/image'
import { useRouter } from 'next/router'
import React, { useState, useEffect } from 'react'
import { isMobile } from 'react-device-detect'
import { cancelRSVP, checkIsAlreadyJoining, getGame, getGameMetaData, getGameWithPasscode, joinAGame, getChatMessages, sendChatMessage, deleteChatMessage } from '../../api/request/GameTestRequest'
import { getSimpleProfile } from '../../api/request/UserRequest'
import { formatDateToString, formatTimeToString, removeSecondsFromTime } from '../../components/DateManager'
import OrganizeForm from '../../components/OrganizeForm'
import { baseUrl, Game, GameMetaData, getPlayerLevelJP, landscapeFieldImgURI, Message } from '../../Definitions'
import { backgroundTheme, borderColor, darkerTextColor, themeColor, useStyles } from '../../public/assets/styles/styles.web'
import { supabase } from '../../SupabaseManager'
import Header from '../../components/Header'
import PageBase from '../PageBase'
import ParticipantsView from '../../components/ParticipantsView'

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
    url: string
    site_name: string
}

export default function GameView({ metadata, url, site_name }: props) {
    const styles = useStyles()
    const router = useRouter()
    const [game, setGame] = useState<Game | null>(null)
    const [width, setWidth] = useState(0)
    const [isJoining, setJoining] = useState(false)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<User | null>()

    const [showPassDialog, openPassDialog] = useState(false)
    const [passcode, setPasscode] = useState<string>("")
    const [authenticating, setAuthenticating] = useState(false)
    const [passErrorMsg, setPassErrorMsg] = useState<string | null>(null)

    const [showJoinConfirmDialog, openJoinConfirmDialog] = useState(false)
    const [joinLoading, setJoinLoading] = useState(false)
    const [joinError, setJoinError] = useState(null)

    const [showEditDialog, openEditDialog] = useState(false)
    const [showSigninDialog, openSigninDialog] = useState(false)
    const [showParticipants, openParticipants] = useState(false)

    const [message, setMessage] = useState("")
    const [messages, setMessages] = useState<Message[]>([])
    const [sending, setSending] = useState(false)

    const [showSnackbar, openSnackbar] = useState(false)
    const [snackMsg, setSnackMsg] = useState("")
    const [snackErrorMsg, setSnackErrorMsg] = useState("")

    useEffect(() => {
        setWidth(window.innerWidth)
    }, [])

    useEffect(() => {
        var chatSubscription: RealtimeSubscription
        if (metadata) {
            chatSubscription = supabase.from('test_game_chats:game_id=eq.' + metadata!.id)
                .on('INSERT', payload => {
                    getSimpleProfile(payload.new.sender).then(user => setMessages(prevState => [...prevState, { id: payload.new.id, game_id: payload.new.game_id, sender: { uid: user.uid, name: user.name, thumbnail_url: user.thumbnail_url, is_private: user.is_private }, content: payload.new.content, timestamp: new Date(payload.new.timestamp) }]))
                }).on('DELETE', payload => {
                    setMessages(prevState => prevState.filter(message => message.id !== payload.old.id))
                }).subscribe()
        }
        return () => {
            if (chatSubscription)
                chatSubscription.unsubscribe()
        }
    }, [metadata])

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
                <Typography variant="h5" style={{ color: "red" }}>このゲームはキャンセルされました</Typography>
            </div>
        if (game?.organizer.uid == user?.id)
            return null
        if (new Date() > new Date(game?.date + "T" + game?.time))
            return null
        if (isJoining)
            return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 16 }}>
                <Button style={{ backgroundColor: "white", color: "red", width: "80%", borderColor: "red", borderWidth: 1, borderStyle: "solid" }} onClick={() => {
                    setJoinLoading(true)
                    cancelRSVP(game!.id, user!.id).then(() => {
                        setJoining(false)
                        setJoinLoading(false)
                    })
                }}>
                    参加取り消し
                </Button>
            </div>
        if (game?.participants == game?.max_players)
            return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 16 }}>
                <Typography style={{ color: "redActu" }}>ゲームの参加者数が上限に達しました</Typography>
            </div>
        return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 16 }}>
            <Button style={{ backgroundColor: "white", color: "red", width: "80%", borderColor: "red", borderWidth: 1, borderStyle: "solid" }} onClick={() => {
                if (user) {
                    openJoinConfirmDialog(true)
                } else {
                    openSigninDialog(true)
                }
            }}>
                ゲームに参加する
            </Button>
        </div>
    }

    function content() {
        if (game) {
            return (
                <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    {(user) ? <Dialog open={showJoinConfirmDialog} fullWidth>
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
                                joinAGame(game.id, user.id).then(() => {
                                    setJoining(true)
                                    openJoinConfirmDialog(false)
                                    setSnackMsg("Joined the game successfully")
                                    openSnackbar(true)
                                }).catch(error => setJoinError(error.message)).finally(() => setJoinLoading(false))
                            }}>参加する</Button>}
                        </DialogActions>
                    </Dialog> : null}
                    {(user) ? <OrganizeForm show={showEditDialog} uid={user.id} game_id={game.id} _title={game.title} _description={game.description} _location={game.location} _date={new Date(game.date)} _time={game.time.toString()} _playerLevel={game.player_level} _passcode={passcode} _maxPlayers={game.max_players} _minPlayers={game.min_players} _customRules={game.custom_rules} _requirements={game.requirements} editing posted={() => {
                        openEditDialog(false)
                        setSnackMsg("The game details updated successfully")
                        reloadDetails()
                        openSnackbar(true)
                    }} onClose={() => openEditDialog(false)} onCancelled={() => {
                        setGame(prevState => ({ ...prevState!, status: "cancelled" }))
                        openEditDialog(false)
                    }} /> : null}
                    <Dialog open={showParticipants} onClick={() => openParticipants(false)} fullScreen>
                        <AppBar style={{ position: "relative" }}>
                            <Toolbar>
                                <IconButton edge="start" color="inherit" onClick={() => openParticipants(false)} aria-label="close">
                                    <Close />
                                </IconButton>
                                <Typography variant="h6" style={{ flex: 1 }}>
                                    参加者
                                </Typography>
                            </Toolbar>
                        </AppBar>
                        <ParticipantsView game_id={metadata!.id} region={"jp"} uid={user?.id} />
                    </Dialog>
                    <Typography component={"div"} style={{ backgroundColor: "#FFFFFF", borderColor: borderColor, borderWidth: 1, borderStyle: "solid" }}>
                        <Image src={landscapeFieldImgURI} width={(isMobile) ? width : width * 0.5} height={300} alt={game.title} />
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", flexWrap: "nowrap", paddingLeft: 8, paddingTop: 8 }}>
                            <Typography variant="h4" style={{ color: darkerTextColor, fontWeight: "bold", flex: 1, overflow: "hidden" }}>
                                {game.title}
                            </Typography>
                            {(game.passcode) ? <LockTwoTone style={{ color: "gray", width: 36, height: 36 }} /> : null}
                            {(game.organizer.uid == user?.id && game.status != "cancelled" && new Date() < new Date(game?.date + "T" + game?.time)) ? <IconButton style={{ backgroundColor: backgroundTheme, width: 48, height: 48, marginRight: 16 }} onClick={() => openEditDialog(true)}>
                                <Edit style={{ color: "white" }} />
                            </IconButton> : null}
                        </div>
                        <Typography component={"div"} style={{ padding: 8, marginTop: 8 }}>
                            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", marginBottom: 16 }} onClick={() => router.push({ pathname: "/" + "jp" + "/player", query: { uid: game.organizer.uid } })}>
                                {(game.organizer.thumbnail_url) ? <Image src={game.organizer.thumbnail_url} width={48} height={48} className={styles.thumbnailCircle48} alt={game.organizer.name} /> : <AccountCircle style={{ width: 48, height: 48, borderRadius: 24 }} />}
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
                                if (user) {
                                    if (message) {
                                        setSending(true)
                                        sendChatMessage(game.id, user.id, message).then(() => { setMessage(""); }).catch(error => console.log(error.message)).finally(() => setSending(false))
                                    } else {
                                        setSnackErrorMsg("メッセージが空です")
                                    }
                                } else {
                                    openSigninDialog(true)
                                }
                            }}>
                                <SendTwoTone style={{ color: themeColor }} />
                            </IconButton>}
                        </div>
                        <List style={{ backgroundColor: "whitesmoke", flexGrow: 1, maxHeight: 300, overflow: "scroll" }}>
                            {messages.map(message => (
                                <ListItem style={{ backgroundColor: "whitesmoke" }} key={message.id}>
                                    <Typography component={"div"} style={{ display: "flex", flexDirection: "row", alignItems: "center", width: "100%" }}>
                                        <div onClick={() => router.push({ pathname: "/" + "jp" + "/player", query: { uid: message.sender.uid } })}>
                                            {(message.sender.thumbnail_url) ? <Image src={message.sender.thumbnail_url} width={48} height={48} className={styles.thumbnailCircle48} alt={message.sender.name} /> : <AccountCircle style={{ width: 48, height: 48, borderRadius: 24 }} />}
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", color: darkerTextColor, marginLeft: 16, width: "100%" }}>
                                            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", width: "100%", maxHeight: 20 }}>
                                                <Typography component={"div"} style={{ fontWeight: "bold", marginRight: 8, flex: 1 }}>
                                                    {message.sender.name}
                                                </Typography>
                                                {formatDateToString(message.timestamp) + " " + formatTimeToString(message.timestamp)}
                                                {(message.sender.uid == user?.id) ? <IconButton onClick={() => deleteChatMessage(message.id)}>
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
                    <Snackbar open={(snackErrorMsg) ? true : false} autoHideDuration={6000} onClose={() => setSnackErrorMsg("")}>
                        <Alert onClose={() => setSnackErrorMsg("")} severity="success">{snackErrorMsg}</Alert>
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

    return <PageBase content={content()} detailView={(game && !isMobile) ? <ParticipantsView game_id={game.id} region={"jp"} uid={user?.id} /> : <div />} wannaShowSigninDialog={showSigninDialog} header={<Header title={(metadata) ? metadata.title : "非公開ゲームか、タイトルの取得に失敗しました"} description={(metadata) ? metadata.description : "非公開ゲームか、説明の取得に失敗しました"} thumbnail_url={""} url={baseUrl + url} site_name={site_name} />} region={"jp"} onStateChanged={user => {
        setUser(user)
        if (metadata) {
            if (user) {
                if (metadata.organizer == user?.id) {
                    reloadDetails()
                    loadChat()
                    return
                }
                checkIsAlreadyJoining(metadata.id, user.id).then(result => {
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
                return
            }
            if (metadata.passcode) {
                setLoading(false)
                openPassDialog(true)
                return
            }
            reloadDetails()
            loadChat()
        } else {
            setLoading(false)
        }
    }} closingSigninDialog={() => openSigninDialog(false)} />
}

export async function getServerSideProps(context: any) {
    const { id } = context.query
    if (id) {
        var data = null
        await getGameMetaData(id).then(metadata => {
            data = metadata
        }).catch(error => console.log(error.message))
        return { props: { metadata: data, url: context["resolvedUrl"], site_name: context["req"].headers.host } }
    } else {
        return { props: { metadata: null, url: context["resolvedUrl"], site_name: context["req"].headers.host } }
    }
}