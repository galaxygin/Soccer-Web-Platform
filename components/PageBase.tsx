import { AppBar, Toolbar, Link, Typography, IconButton, TextField, MenuItem, Snackbar, Menu, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, BottomNavigation, BottomNavigationAction, WithStyles } from "@material-ui/core";
import { AccountCircle, Home, SportsSoccerTwoTone, EmojiEventsTwoTone, Search } from "@material-ui/icons";
import { Alert } from "@material-ui/lab";
import { User } from "@supabase/supabase-js";
import { WithRouterProps } from "next/dist/client/with-router";
import router from "next/router";
import React from "react";
import { addUserToDB, getUser, signOut } from "../api/request/AuthRequest";
import { getSimpleProfile, checkUserRegisteredAsPlayer } from "../api/request/UserRequest";
import { SigninDialog } from "./SigninDialog";
import { appName, languages, regions } from "../Definitions";
import { backgroundTheme, classStyles, darkerTextColor, defaultTheme, goldColor } from "../public/assets/styles/styles.web";
import Header from "./Header";
import Cookies from "universal-cookie";
import { isMobile } from "react-device-detect";
import { ThumbnailUploader, HeaderUploader } from "./ImageUploader";
import Image from "next/image";

var translationXML = require('xml-loader!../public/assets/Translations.xml');

export interface BaseProps extends WithStyles<typeof classStyles>, WithRouterProps {
    region: string
}

export interface BaseStates {
    region: string
    language: string
    loaded?: boolean
    width?: number
    height?: number
    selectedNavValue: string
    thumbnail_url?: string
    header_url?: string | null
    showSetupDialog?: boolean
    name?: string
    bio?: string
    localArea?: string
    position?: string
    setupErrorMsg?: string
    newThumb?: File
    thumbLoading?: boolean
    thumbErrorMsg?: string
    newHeader?: File
    headerLoading?: boolean
    headerErrorMsg?: string
    showSigninDialog?: boolean
    signinMode?: string
    changingRegion?: boolean
    snackSuccessMsg?: string,
    snackErrorMsg?: string,
    anchorEl?: HTMLElement | null
    user?: User | null
}

const cookies = new Cookies();

export default abstract class PageBaseClass<Props extends BaseProps, State extends BaseStates, SS = any> extends React.Component<Props, State, SS> {
    styles: Props["classes"];
    languages = translationXML.xml.Translations[0]

    constructor(props: Props) {
        super(props);

        this.styles = props.classes;
    }

    updateDimensions = () => {
        this.setState({ width: window.innerWidth, height: window.innerHeight });
    };

    componentDidMount() {
        window.addEventListener('resize', this.updateDimensions);
        this.setState({
            loaded: false,
            width: window.innerWidth,
            height: window.innerHeight,
            thumbnail_url: "",
            header_url: "",
            showSetupDialog: false,
            name: "",
            bio: "",
            localArea: "",
            position: "",
            setupErrorMsg: "",
            showSigninDialog: false,
            signinMode: "Sign in",
            changingRegion: false,
            snackSuccessMsg: "",
            snackErrorMsg: "",
            anchorEl: null
        })
        console.log(getUser())
        if (getUser()) {
            if (cookies.get("user_setup_finished"))
                getSimpleProfile(getUser()!.id).then(player => {
                    if (player)
                        this.setState({ thumbnail_url: player.thumbnail_url })
                }).catch(error => this.showSnackErrorMsg(error.message)).finally(() => this.setState({ user: getUser(), loaded: true }, () => this.onBaseLoaded()))
            else
                checkUserRegisteredAsPlayer(getUser()!.id).then(result => {
                    if (result) {
                        cookies.set('user_setup_finished', true)
                        getSimpleProfile(getUser()!.id).then(player => {
                            if (player)
                                this.setState({ thumbnail_url: player.thumbnail_url })
                        }).catch(error => this.showSnackErrorMsg(error.message)).finally(() => this.setState({ user: getUser(), loaded: true }, () => this.onBaseLoaded()))
                    } else {
                        this.setState({ showSetupDialog: true })
                    }
                }).catch(error => {
                    this.setState({ snackErrorMsg: error.message })
                })
        } else
            this.setState({ user: getUser(), loaded: true }, () => this.onBaseLoaded())
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
        this.onBaseWillClose()
    }

    abstract onBaseLoaded(): void

    onBaseWillClose() {

    }

    renderHeader(): JSX.Element {
        return <Header />
    }

    abstract renderContent(): JSX.Element

    renderDetailView(): JSX.Element {
        return <div />;
    }

    showSnackSuccessMsg(message: string) {
        this.setState({ snackSuccessMsg: message })
    }

    showSnackErrorMsg(message: string) {
        if (message == "JWT expired") {
            this.setState({ snackErrorMsg: "Session expired. Please refresh the page" })
        } else {
            this.setState({ snackErrorMsg: message })
        }
    }

    showSigninDialog() {
        this.setState({ showSigninDialog: true })
    }

    getTranslationOf(key: string, language: string = this.state.language) {
        return this.languages[language][0][key][0]
    }

    handleMenuClose = () => {
        this.setState({ anchorEl: null })
    }

    accountMenu() {
        if (getUser()) {
            return (
                <Menu
                    anchorEl={this.state.anchorEl}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    id={"account-menu"}
                    keepMounted
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    open={(this.state.anchorEl) ? true : false}
                    onClose={this.handleMenuClose}
                >
                    <MenuItem onClick={() => {
                        this.handleMenuClose()
                        router.push({ pathname: "/" + this.state.region + "/player", query: { uid: getUser()!.id } })
                    }}>Profile <AccountCircle style={{ marginLeft: 8 }} /></MenuItem>
                    <MenuItem onClick={() => {
                        this.handleMenuClose()
                        signOut().then(() => {
                            cookies.remove("user_setup_finished")
                            window.location.href = "/" + this.state.region
                        })
                    }}>Sign out</MenuItem>
                </Menu>
            )
        } else {
            return (
                <Menu
                    anchorEl={this.state.anchorEl}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    id={"account-menuu"}
                    keepMounted
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    open={(this.state.anchorEl) ? true : false}
                    onClose={this.handleMenuClose}
                >
                    <MenuItem onClick={() => {
                        this.setState({ signinMode: "Sign in", showSigninDialog: true, anchorEl: null })
                    }}>Sign in</MenuItem>
                    <MenuItem onClick={() => {
                        this.setState({ signinMode: "Sign up", showSigninDialog: true, anchorEl: null })
                    }}>Sign up</MenuItem>
                </Menu>
            )
        }
    }

    playerSetupDialog() {
        if (!getUser())
            return
        switch (this.state.region) {
            case "jp":
                return (
                    <Dialog open={this.state.showSetupDialog!} onClose={() => this.setState({ showSetupDialog: false })} fullScreen>
                        <DialogTitle>プロフィール設定</DialogTitle>
                        <DialogContent>
                            {(this.state.setupErrorMsg) ? <Alert severity="error">{this.state.setupErrorMsg}</Alert> : null}
                            <Typography variant="h5" >
                                必須項目
                            </Typography>
                            <Typography>
                                これらは設定に最低限必要な情報となります。
                            </Typography>
                            <TextField label="表示名" variant="outlined" className={this.styles.formTextField} onChange={e => this.setState({ name: e.target.value })} value={this.state.name} fullWidth />
                            <TextField label="説明 (あなた自身について簡単に説明してください)" variant="outlined" className={this.styles.formTextField} onChange={e => this.setState({ bio: e.target.value })} value={this.state.bio} fullWidth multiline minRows={4} />
                            <Typography variant="h5" style={{ marginTop: 32 }} paragraph>オプション</Typography>
                            <ThumbnailUploader uid={getUser()!.id} region={this.state.region} onSuccess={url => this.setState({ thumbnail_url: url })} /><br />
                            <HeaderUploader uid={getUser()!.id} region={this.state.region} imagePreviewWidth={this.state.width! * 0.5} />
                            <TextField label="地元" variant="outlined" className={this.styles.formTextField} onChange={e => this.setState({ localArea: e.target.value })} value={this.state.localArea} fullWidth />
                            <TextField label="ポジション" variant="outlined" className={this.styles.formTextField} onChange={e => this.setState({ position: e.target.value })} defaultValue={this.state.position} fullWidth select>
                                <MenuItem key={""} value={""}>Anywhere</MenuItem>
                                <MenuItem key={"GK"} value={"GK"}>GK</MenuItem>
                                <MenuItem key={"CB"} value={"CB"}>CB</MenuItem>
                                <MenuItem key={"SB"} value={"SB"}>SB</MenuItem>
                                <MenuItem key={"MF"} value={"MF"}>MF</MenuItem>
                                <MenuItem key={"CF"} value={"CF"}>CF</MenuItem>
                                <MenuItem key={"LW"} value={"LW"}>LW</MenuItem>
                                <MenuItem key={"RW"} value={"RW"}>RW</MenuItem>
                            </TextField>
                        </DialogContent>
                        <DialogActions>
                            <Button style={{ backgroundColor: "red", color: "white" }} onClick={() => {
                                if (!this.state.name) {
                                    this.setState({ setupErrorMsg: "表示名は必須です" })
                                    return
                                }
                                if (!this.state.bio) {
                                    this.setState({ setupErrorMsg: "説明は必須です" })
                                    return
                                }
                                addUserToDB(getUser()!.id, this.state.name, this.state.bio, this.state.localArea, this.state.position).then(() => {
                                    cookies.set("user_setup_finished", true)
                                    this.setState({ user: getUser(), loaded: true, showSetupDialog: false }, () => this.onBaseLoaded())
                                }).catch(error => this.setState({ setupErrorMsg: error.message }))
                            }}>完了</Button>
                        </DialogActions>
                    </Dialog>
                )
            default:
                return (
                    <Dialog open={this.state.showSetupDialog!} onClose={() => this.setState({ showSetupDialog: false })} fullScreen>
                        <DialogTitle>Setup Profile</DialogTitle>
                        <DialogContent>
                            {(this.state.setupErrorMsg) ? <Alert severity="error">{this.state.setupErrorMsg}</Alert> : null}
                            <Typography variant="h5" >
                                Required
                            </Typography>
                            <Typography>
                                We need these informations at least
                            </Typography>
                            <TextField label="Name" variant="outlined" className={this.styles.formTextField} onChange={e => this.setState({ name: e.target.value })} value={this.state.name} fullWidth />
                            <TextField label="Bio (Simply describe yourself)" variant="outlined" className={this.styles.formTextField} onChange={e => this.setState({ bio: e.target.value })} value={this.state.bio} fullWidth multiline minRows={4} />
                            <Typography variant="h5" style={{ marginTop: 32 }} paragraph>Optional</Typography>
                            <ThumbnailUploader uid={getUser()!.id} region={this.state.region} onSuccess={url => this.setState({ thumbnail_url: url })} /><br />
                            <HeaderUploader uid={getUser()!.id} region={this.state.region} imagePreviewWidth={this.state.width! * 0.5} />
                            <TextField label="Local area" variant="outlined" className={this.styles.formTextField} onChange={e => this.setState({ localArea: e.target.value })} value={this.state.localArea} fullWidth />
                            <TextField label="Position" variant="outlined" className={this.styles.formTextField} onChange={e => this.setState({ position: e.target.value })} defaultValue={this.state.position} fullWidth select>
                                <MenuItem key={""} value={""}>Anywhere</MenuItem>
                                <MenuItem key={"GK"} value={"GK"}>GK</MenuItem>
                                <MenuItem key={"CB"} value={"CB"}>CB</MenuItem>
                                <MenuItem key={"SB"} value={"SB"}>SB</MenuItem>
                                <MenuItem key={"MF"} value={"MF"}>MF</MenuItem>
                                <MenuItem key={"CF"} value={"CF"}>CF</MenuItem>
                                <MenuItem key={"LW"} value={"LW"}>LW</MenuItem>
                                <MenuItem key={"RW"} value={"RW"}>RW</MenuItem>
                            </TextField>
                        </DialogContent>
                        <DialogActions>
                            <Button style={{ backgroundColor: "red", color: "white" }} onClick={() => {
                                if (!this.state.name) {
                                    this.setState({ setupErrorMsg: "Name is required" })
                                    return
                                }
                                if (!this.state.bio) {
                                    this.setState({ setupErrorMsg: "Bio is required" })
                                    return
                                }
                                addUserToDB(getUser()!.id, this.state.name, this.state.bio, this.state.localArea, this.state.position).then(() => {
                                    cookies.set("user_setup_finished", true)
                                    this.setState({ user: getUser(), loaded: true, showSetupDialog: false }, () => this.onBaseLoaded())
                                }).catch(error => this.setState({ setupErrorMsg: error.message }))
                            }}>Done</Button>
                        </DialogActions>
                    </Dialog>
                )
        }
    }

    renderDesktopNavMenu() {
        return <div style={{ width: "25%", alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
            <Typography style={{ backgroundColor: defaultTheme, width: "90%", height: 50, color: darkerTextColor, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 25, marginTop: 16 }} variant="h5" onClick={() => router.push("/" + this.state.region)}>
                {this.getTranslationOf("home", this.state.language)} <Home style={{ marginLeft: 8, width: 40, height: 30, color: goldColor }} />
            </Typography>
            <Typography style={{ backgroundColor: defaultTheme, width: "90%", height: 50, color: darkerTextColor, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 25, marginTop: 16 }} variant="h5" onClick={() => router.push("/" + this.state.region + "/games")}>
                {this.getTranslationOf("games", this.state.language)} <SportsSoccerTwoTone style={{ marginLeft: 8, width: 40, height: 30, color: goldColor }} />
            </Typography>
            <Typography style={{ backgroundColor: defaultTheme, width: "90%", height: 50, color: darkerTextColor, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 25, marginTop: 16 }} variant="h5" onClick={() => router.push("/" + this.state.region + "/tournaments")}>
                {this.getTranslationOf("tournaments", this.state.language)} <EmojiEventsTwoTone style={{ marginLeft: 8, width: 40, height: 30, color: goldColor }} />
            </Typography>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", color: "white", marginTop: 16 }}>
                ©️ AIZero Inc. 2021     {this.getTranslationOf("region")}: {(this.state.changingRegion) ? <CircularProgress /> : <TextField onChange={e => {
                    this.setState({ changingRegion: true })
                    router.push("../" + e.target.value)
                }} value={this.state.region} select style={{ marginLeft: 8, backgroundColor: "silver" }} >
                    {regions.map(region => (
                        <MenuItem key={region.key} value={region.value}>{region.label}</MenuItem>
                    ))}
                </TextField>} {this.getTranslationOf("language")}: <TextField onChange={e => {
                    this.setState({ language: e.target.value })
                }} value={this.state.region} select style={{ marginLeft: 8, backgroundColor: "silver" }} >
                    {languages.map(language => (
                        <MenuItem key={language.key} value={language.value}>{language.label}</MenuItem>
                    ))}
                </TextField>
            </div>
        </div>
    }

    render() {
        if (isMobile) {
            return (
                <div className={this.styles.root} style={{ overflow: "hidden" }}>
                    {this.renderHeader()}
                    <AppBar position="fixed" >
                        <Toolbar>
                            <Link href="/" color="inherit">
                                <Typography variant="h6" style={{ color: darkerTextColor }} noWrap>{appName}</Typography>
                            </Link>
                            <div className={this.styles.grow} />
                            <IconButton
                                edge="end"
                                aria-label="account of current user"
                                aria-controls={"account menu"}
                                aria-haspopup="true"
                                onClick={e => this.setState({ anchorEl: e.currentTarget })}
                                color="inherit"
                            >
                                {(this.state.thumbnail_url) ? <Image src={this.state.thumbnail_url} width={36} height={36} className={this.styles.thumbnailCircle36} alt={"account thumbnail"} /> : <AccountCircle style={{ width: 36, height: 36, borderRadius: 12 }} />}
                            </IconButton>
                        </Toolbar>
                    </AppBar>
                    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: this.state.height, overflow: "hidden" }}>
                        <main style={{ backgroundColor: defaultTheme, width: "100%", overflow: "scroll" }}>
                            <div className={this.styles.drawerHeader} />
                            <SigninDialog show={(this.state.showSigninDialog) ? this.state.showSigninDialog : false} region={this.state.region!} mode={this.state.signinMode} signedIn={user => {
                                this.setState({ showSigninDialog: false })
                            }} onClose={() => {
                                this.setState({ showSigninDialog: false })
                            }} />
                            <div style={{ height: 5 }} />
                            {this.renderContent()}
                        </main>
                        <BottomNavigation
                            value={this.state.selectedNavValue}
                            onChange={(e, value) => {
                                this.setState({ selectedNavValue: value })
                                router.push("/" + this.state.region + "/" + value)
                            }}
                            showLabels
                            style={{ backgroundColor: 'white', width: "100%", borderColor: backgroundTheme, borderWidth: 1, borderStyle: "solid" }}
                        >
                            <BottomNavigationAction label={this.getTranslationOf("home", this.state.language)} icon={<Home style={{ color: goldColor }} />} value="/" style={{ color: darkerTextColor }} />
                            <BottomNavigationAction label={this.getTranslationOf("games", this.state.language)} icon={<SportsSoccerTwoTone style={{ color: goldColor }} />} value="games" style={{ color: darkerTextColor }} />
                            <BottomNavigationAction label={this.getTranslationOf("tournaments", this.state.language)} icon={<EmojiEventsTwoTone style={{ color: goldColor }} />} value="tournaments" style={{ color: darkerTextColor }} />
                        </BottomNavigation>
                    </div>
                    <Snackbar open={(this.state.snackSuccessMsg) ? true : false} autoHideDuration={6000} onClose={() => this.setState({ snackSuccessMsg: "" })}>
                        <Alert onClose={() => this.setState({ snackSuccessMsg: "" })} severity="error">{this.state.snackSuccessMsg}</Alert>
                    </Snackbar>
                    <Snackbar open={(this.state.snackErrorMsg) ? true : false} autoHideDuration={6000} onClose={() => this.setState({ snackErrorMsg: "" })}>
                        <Alert onClose={() => this.setState({ snackErrorMsg: "" })} severity="error">{this.state.snackErrorMsg}</Alert>
                    </Snackbar>
                    {this.playerSetupDialog()}
                    {this.accountMenu()}
                </div>
            )
        } else
            return (
                <div className={this.styles.root}>
                    {this.renderHeader()}
                    <AppBar position="fixed" className={this.styles.appBar}>
                        <Toolbar>
                            <Link href="/" color="inherit">
                                <Typography variant="h6" style={{ color: darkerTextColor }} noWrap>{appName}</Typography>
                            </Link>
                            <div className={this.styles.grow} />
                            <IconButton
                                edge="end"
                                aria-label="account of current user"
                                aria-controls={"account menu"}
                                aria-haspopup="true"
                                onClick={e => this.setState({ anchorEl: e.currentTarget })}
                                color="inherit"
                            >
                                {(this.state.thumbnail_url) ? <Image src={this.state.thumbnail_url} width={36} height={36} className={this.styles.thumbnailCircle36} alt={"account thumbnail"} /> : <AccountCircle style={{ width: 36, height: 36, borderRadius: 12 }} />}
                            </IconButton>
                        </Toolbar>
                    </AppBar>
                    <main style={{ width: this.state.width, display: 'flex', flexDirection: 'column' }}>
                        <div className={this.styles.drawerHeader} />
                        <SigninDialog show={(this.state.showSigninDialog) ? this.state.showSigninDialog : false} region={this.state.region!} mode={this.state.signinMode} signedIn={user => {
                            this.setState({ showSigninDialog: false })
                        }} onClose={() => {
                            this.setState({ showSigninDialog: false })
                        }} />
                        <div style={{ display: "flex" }}>
                            {this.renderDesktopNavMenu()}
                            <div style={{ width: "50%", height: (this.state.height) ? this.state.height! - 70 : 0, borderColor: defaultTheme, borderWidth: 1, borderStyle: "solid", background: defaultTheme, overflow: "scroll" }}>
                                {this.renderContent()}
                            </div>
                            <div style={{ width: "25%", display: 'flex', flexDirection: 'column', overflow: "scroll" }}>
                                {this.renderDetailView()}
                            </div>
                        </div>
                    </main>
                    <Snackbar open={(this.state.snackSuccessMsg) ? true : false} autoHideDuration={6000} onClose={() => this.setState({ snackSuccessMsg: "" })}>
                        <Alert onClose={() => this.setState({ snackSuccessMsg: "" })} severity="success">{this.state.snackSuccessMsg}</Alert>
                    </Snackbar>
                    <Snackbar open={(this.state.snackErrorMsg) ? true : false} autoHideDuration={6000} onClose={() => this.setState({ snackErrorMsg: "" })}>
                        <Alert onClose={() => this.setState({ snackErrorMsg: "" })} severity="error">{this.state.snackErrorMsg}</Alert>
                    </Snackbar>
                    {this.playerSetupDialog()}
                    {this.accountMenu()}
                </div>
            )
    }
}