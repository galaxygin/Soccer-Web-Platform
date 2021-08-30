import { AppBar, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, List, ListItem, TextField, Toolbar, Typography, withStyles } from "@material-ui/core";
import { Close, LockTwoTone, Edit, AccountCircle, SendTwoTone, DeleteTwoTone } from "@material-ui/icons";
import { Alert } from "@material-ui/lab";
import { RealtimeSubscription } from "@supabase/supabase-js";
import Image from "next/image";
import router, { withRouter } from "next/router";
import React from "react";
import { isMobile } from "react-device-detect";
import { cancelRSVP, checkIsAlreadyJoining, deleteChatMessage, getChatMessages, getGame, getGameMetaData, getGameWithPasscode, joinAGame, sendChatMessage } from "../../api/request/GameTestRequest";
import { getSimpleProfile } from "../../api/request/UserRequest";
import { removeSecondsFromTime, formatDateToString, formatTimeToString } from "../../components/DateManager";
import OrganizeForm from "../../components/OrganizeForm";
import { baseUrl, Game, GameMetaData, getPlayerLevel, landscapeFieldImgURI, Message } from "../../Definitions";
import { backgroundTheme, borderColor, darkerTextColor, themeColor } from "../../public/assets/styles/styles.web";
import { supabase } from "../../SupabaseManager";
import ParticipantsView from "../../components/ParticipantsView";
import Header from "../../components/Header";
import PageBase, { BaseProps, BaseStates, styles } from "../../components/PageBase";

interface Props extends BaseProps {
    metadata: GameMetaData | null
    url: string
    site_name: string
}

interface States extends BaseStates {
    game: Game | null
    isJoining: boolean
    loading: boolean
    showPassDialog: boolean
    passcode: string
    authenticating: boolean
    passErrorMsg: string
    showJoinConfirmDialog: boolean
    joinLoading: boolean
    joinError: string
    showEditDialog: boolean
    showParticipants: boolean
    message: string
    messages: Message[]
    sending: boolean
}

class GameView extends PageBase<Props, States> {
    state: States = {
        region: "class",
        selectedNavValue: "/",
        game: null,
        isJoining: false,
        loading: true,
        showPassDialog: false,
        passcode: "",
        authenticating: false,
        passErrorMsg: "",
        showJoinConfirmDialog: false,
        joinLoading: false,
        joinError: "",
        showEditDialog: false,
        showParticipants: false,
        message: "",
        messages: [],
        sending: false
    }
    chatSubscription?: RealtimeSubscription

    onBaseLoaded() {
        if (this.props.metadata) {
            if (this.state.user) {
                if (this.props.metadata.organizer == this.state.user?.id) {
                    this.initialLoad()
                    return
                }
                checkIsAlreadyJoining(this.props.metadata.id, this.state.user.id).then(result => {
                    this.setState({ isJoining: result })
                    if (result) {
                        this.initialLoad()
                    } else
                        if (this.props.metadata!.passcode) {
                            this.setState({ loading: false, showPassDialog: true })
                        } else {
                            this.initialLoad()
                        }
                }).catch(error => this.showSnackErrorMsg(error.message))
                return
            }
            if (this.props.metadata.passcode) {
                this.setState({ loading: false, showPassDialog: true })
                return
            }
            this.initialLoad()
        } else {
            this.setState({ loading: false })
        }
    }

    initialLoad() {
        this.reloadDetails()
        this.loadChat()
        this.chatSubscription = supabase.from('test_game_chats:game_id=eq.' + this.props.metadata!.id)
            .on('INSERT', payload => {
                getSimpleProfile(payload.new.sender).then(user => this.setState(prevState => ({ messages: [...prevState.messages, { id: payload.new.id, game_id: payload.new.game_id, sender: { uid: user.uid, name: user.name, thumbnail_url: user.thumbnail_url, is_private: user.is_private }, content: payload.new.content, timestamp: new Date(payload.new.timestamp) }] }))).catch(error => this.showSnackErrorMsg(error.message))
            }).on('DELETE', payload => {
                this.setState(prevState => ({ messages: prevState.messages.filter(message => message.id !== payload.old.id) }))
            }).subscribe()
    }

    onBaseWillClose() {
        if (this.chatSubscription)
            this.chatSubscription.unsubscribe()
    }

    reloadDetails() {
        this.setState({ loading: true })
        getGame(this.props.metadata!.id).then(game => this.setState({ game: game })).catch(error => this.showSnackErrorMsg(error.message)).finally(() => this.setState({ loading: false }))
    }

    loadChat() {
        getChatMessages(this.props.metadata!.id).then(messages => this.setState({ messages: messages }))
    }

    renderByStatus() {
        if (this.state.game?.status == "cancelled")
            return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 16 }}>
                <Typography variant="h5" style={{ color: "red" }}>This game has been cancelled</Typography>
            </div>
        if (this.state.game?.organizer.uid == this.state.user?.id)
            return null
        if (new Date() > new Date(this.state.game?.date + "T" + this.state.game?.time))
            return null
        if (this.state.isJoining)
            return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 16 }}>
                <Button style={{ backgroundColor: "white", color: "red", width: "80%", borderColor: "red", borderWidth: 1, borderStyle: "solid" }} onClick={() => {
                    this.setState({ joinLoading: true })
                    cancelRSVP(this.state.game!.id, this.state.user!.id).then(() => this.setState({ isJoining: false })).catch(error => this.showSnackErrorMsg(error.message)).finally(() => this.setState({ joinLoading: false }))
                }}>
                    Cancel commission
                </Button>
            </div>
        if (this.state.game?.participants == this.state.game?.max_players)
            return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 16 }}>
                <Typography style={{ color: "redActu" }}>The number of the participants has exceeded the max number of players</Typography>
            </div>
        return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 16 }}>
            <Button style={{ backgroundColor: "white", color: "red", width: "80%", borderColor: "red", borderWidth: 1, borderStyle: "solid" }} onClick={() => {
                if (this.state.user) {
                    this.setState({ showJoinConfirmDialog: true })
                } else {
                    this.showSigninDialog()
                }
            }}>
                Join this game
            </Button>
        </div>
    }

    renderHeader() {
        if (this.props.metadata)
            return <Header title={this.props.metadata.title} description={this.props.metadata.description} thumbnail_url={""} url={baseUrl + this.props.url} site_name={this.props.site_name} />
        return <Header title={"Couldn't get title"} description={"Couldn't get description"} thumbnail_url={""} url={baseUrl + this.props.url} site_name={this.props.site_name} />
    }

    renderContent() {
        if (this.state.game) {
            return (
                <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    {(this.state.user) ? <Dialog open={this.state.showJoinConfirmDialog} fullWidth>
                        <DialogTitle>Consent</DialogTitle>
                        <DialogContent>
                            Do you want to join this game?<br />
                            By joining this game, you must follow the rules and requirement of the game.<br />
                            Also, if you do any of the following during the game, you&apos;ll get warning score that gives you step by step restrictions<br />
                            ・No show<br />
                            ・Violence<br />
                            ・Harrassment<br />
                            ・Racism<br />
                            ・Breaching the rules<br />
                            {(this.state.joinError) ? <Alert severity="error">{this.state.joinError}</Alert> : null}<br />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => this.setState({ showJoinConfirmDialog: false })}>Go back</Button>
                            <div style={{ flexGrow: 1 }} />
                            {(this.state.joinLoading) ? <CircularProgress /> : <Button style={{ backgroundColor: "red", color: "white" }} onClick={() => {
                                this.setState({ joinLoading: true })
                                joinAGame(this.state.game!.id, this.state.user!.id).then(() => {
                                    this.setState({ isJoining: true, showJoinConfirmDialog: false, joinLoading: false })
                                    this.showSnackSuccessMsg("Joined the game successfully")
                                }).catch(error => this.setState({ joinLoading: false }))
                            }}>Join</Button>}
                        </DialogActions>
                    </Dialog> : null}
                    {(this.state.user) ? <OrganizeForm show={this.state.showEditDialog} uid={this.state.user.id} game_id={this.state.game.id} _title={this.state.game.title} _description={this.state.game.description} _location={this.state.game.location} _date={new Date(this.state.game.date)} _time={this.state.game.time.toString()} _playerLevel={this.state.game.player_level} _passcode={this.state.passcode} _maxPlayers={this.state.game.max_players} _minPlayers={this.state.game.min_players} _customRules={this.state.game.custom_rules} _requirements={this.state.game.requirements} editing posted={() => {
                        this.setState({ showEditDialog: false })
                        this.reloadDetails()
                        this.showSnackSuccessMsg("The game details updated successfully")
                    }} onClose={() => this.setState({ showEditDialog: false })} onCancelled={() => {
                        this.setState(prevState => ({ game: { ...prevState.game!, status: "cancelled" }, showEditDialog: false }))
                    }} /> : null}
                    <Dialog open={this.state.showParticipants} onClick={() => this.setState({ showParticipants: false })} fullScreen>
                        <AppBar style={{ position: "relative" }}>
                            <Toolbar>
                                <IconButton edge="start" color="inherit" onClick={() => this.setState({ showParticipants: false })} aria-label="close">
                                    <Close />
                                </IconButton>
                                <Typography variant="h6" style={{ flex: 1 }}>
                                    Participants
                                </Typography>
                            </Toolbar>
                        </AppBar>
                        <ParticipantsView game_id={this.props.metadata!.id} region={this.state.region} uid={this.state.user?.id} />
                    </Dialog>
                    <Typography component={"div"} style={{ backgroundColor: "#FFFFFF", borderColor: borderColor, borderWidth: 1, borderStyle: "solid" }}>
                        <Image src={landscapeFieldImgURI} width={(isMobile) ? this.state.width : this.state.width! * 0.5} height={300} alt={this.state.game.title} />
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", flexWrap: "nowrap", paddingLeft: 8 }}>
                            <Typography variant="h4" style={{ color: darkerTextColor, fontWeight: "bold", flex: 1, overflow: "hidden", maxHeight: 48 }}>
                                {this.state.game.title}
                            </Typography>
                            {(this.state.game.passcode) ? <LockTwoTone style={{ color: "gray", width: 36, height: 36, marginRight: 8 }} /> : null}
                            {(this.state.game.organizer.uid == this.state.user?.id && this.state.game.status != "cancelled" && new Date() < new Date(this.state.game?.date + "T" + this.state.game?.time)) ? <IconButton style={{ backgroundColor: backgroundTheme, marginRight: 16 }} onClick={() => this.setState({ showEditDialog: true })}>
                                <Edit style={{ color: "white" }} />
                            </IconButton> : null}
                        </div>
                        <Typography component={"div"} style={{ padding: 8, marginTop: 8 }}>
                            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", marginBottom: 16 }} onClick={() => router.push({ pathname: "/" + "class" + "/player", query: { uid: this.state.game!.organizer.uid } })}>
                                {(this.state.game.organizer.thumbnail_url) ? <Image src={this.state.game.organizer.thumbnail_url} width={48} height={48} className={this.styles.thumbnailCircle48} alt={this.state.game.organizer.name} /> : <AccountCircle style={{ width: 48, height: 48, borderRadius: 24 }} />}
                                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", color: darkerTextColor, marginLeft: 8, height: 48 }}>
                                    <div style={{ fontWeight: "bold", fontSize: 20, height: 30 }}>
                                        {this.state.game.organizer.name}
                                    </div>
                                    Organizer
                                </div>
                            </div>
                            {this.state.game.description}<br />
                            Location: {this.state.game.location}<br />
                            Date: {this.state.game.date + " " + removeSecondsFromTime(this.state.game.time)}<br />
                            Level: {getPlayerLevel(this.state.game.player_level)}<br />
                            {(this.state.game.max_players) ? <>Max players: {this.state.game.max_players}<br /></> : null}
                            {(isMobile) ? <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 16 }}>
                                <Button style={{ backgroundColor: "white", color: backgroundTheme, width: "80%", borderColor: backgroundTheme, borderWidth: 1, borderStyle: "solid" }} onClick={() => this.setState({ showParticipants: true })}>
                                    Current players ({this.state.game.participants})
                                </Button>
                            </div> : null}
                            {this.renderByStatus()}
                        </Typography>
                    </Typography>
                    <div>
                        <div style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
                            <TextField label="Send message to participants" variant="outlined" className={this.styles.formTextField} onChange={e => this.setState({ message: e.target.value })} value={this.state.message} fullWidth style={{ marginTop: 0 }} />
                            {(this.state.sending) ? <CircularProgress /> : <IconButton onClick={() => {
                                if (this.state.user) {
                                    if (this.state.message) {
                                        this.setState({ sending: true })
                                        sendChatMessage(this.state.game!.id, this.state.user!.id, this.state.message).then(() => this.setState({ message: "" })).catch(error => this.showSnackErrorMsg(error.message)).finally(() => this.setState({ sending: false }))
                                    } else {
                                        this.showSnackErrorMsg("Message is empty")
                                    }
                                } else {
                                    this.showSigninDialog()
                                }
                            }}>
                                <SendTwoTone style={{ color: themeColor }} />
                            </IconButton>}
                        </div>
                        <List style={{ backgroundColor: "whitesmoke", flexGrow: 1, maxHeight: 300, overflow: "scroll" }}>
                            {this.state.messages.map(message => (
                                <ListItem style={{ backgroundColor: "whitesmoke" }} key={message.id}>
                                    <Typography component={"div"} style={{ display: "flex", flexDirection: "row", alignItems: "center", width: "100%" }}>
                                        {(message.sender.thumbnail_url) ? <Image src={message.sender.thumbnail_url} width={48} height={48} className={this.styles.thumbnailCircle48} alt={this.state.game?.organizer.name} onClick={() => router.push({ pathname: "/" + this.state.region + "/player", query: { uid: message.sender.uid } })} /> : <AccountCircle style={{ width: 48, height: 48, borderRadius: 24 }} />}
                                        <div style={{ display: "flex", flexDirection: "column", color: darkerTextColor, marginLeft: 16, width: "100%" }}>
                                            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", width: "100%", maxHeight: 20 }}>
                                                <Typography component={"div"} style={{ fontWeight: "bold", marginRight: 8, flex: 1 }}>
                                                    {message.sender.name}
                                                </Typography>
                                                {formatDateToString(message.timestamp) + " " + formatTimeToString(message.timestamp)}
                                                {(message.sender.uid == this.state.user?.id) ? <IconButton onClick={() => deleteChatMessage(message.id)}>
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
                </div >
            )
        } else {
            if (this.state.loading)
                return <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <CircularProgress style={{ color: backgroundTheme }} />
                </div>
            else
                return (
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <Dialog open={this.state.showPassDialog} fullScreen>
                            <DialogTitle>Passcode required</DialogTitle>
                            <DialogContent>
                                This game requires passcode to see the details.<br />
                                Please enter the passcode you are provided.<br /><br />
                                {(this.state.passErrorMsg) ? <Alert severity="error">{this.state.passErrorMsg}</Alert> : null}<br />
                                <TextField label="Passcode" variant="outlined" className={this.styles.formTextField} onChange={e => this.setState({ passcode: e.target.value })} value={this.state.passcode} fullWidth />
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => router.back()}>Go back</Button>
                                <div style={{ flexGrow: 1 }} />
                                {(this.state.authenticating) ? <CircularProgress /> : <Button style={{ backgroundColor: "red", color: "white" }} onClick={() => {
                                    this.setState({ authenticating: true })
                                    getGameWithPasscode(router.query.id as string, this.state.passcode!).then(game => {
                                        if (game) {
                                            this.setState({ game: game, showPassDialog: false, loading: false, authenticating: true }, () => this.loadChat())
                                        } else {
                                            this.setState({ passErrorMsg: "Could not get game detail. Check the passcode or network.", authenticating: false })
                                        }
                                    }).catch(error => this.setState({ passErrorMsg: error.message, authenticating: false }))
                                }}>Proceed</Button>}
                            </DialogActions>
                        </Dialog>
                        <Typography component={"div"} style={{ color: darkerTextColor }}>
                            Couldn&apos;t get game details. Please try again
                        </Typography>
                    </div >
                )
        }
    }

    renderDetailView() {
        if (this.state.game && !isMobile)
            return <ParticipantsView game_id={this.props.metadata!.id} region={this.state.region} uid={this.state.user?.id} />
        else
            return <div />
    }
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

export default withStyles(styles, { withTheme: true })(withRouter(GameView));