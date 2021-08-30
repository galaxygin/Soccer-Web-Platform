import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router'
import { Link, MenuItem, IconButton, Menu, AppBar, Toolbar, Typography, BottomNavigation, BottomNavigationAction, Dialog, Button, DialogActions, DialogContent, DialogTitle, TextField, Snackbar, CircularProgress } from '@material-ui/core';
import { AccountCircle, EmojiEventsTwoTone, Home, Search, SportsSoccerTwoTone } from '@material-ui/icons';
import Header from '../components/Header';
import { backgroundTheme, darkerTextColor, defaultTheme, drawerStyles, goldColor, useStyles } from '../public/assets/styles/styles.web';
import { appName, regions } from '../Definitions';
import { isMobile } from 'react-device-detect'
import { addUserToDB, getUser, signOut } from '../api/request/AuthRequest';
import { checkUserRegisteredAsPlayer, getSimpleProfile } from '../api/request/UserRequest';
import { Alert } from '@material-ui/lab';
import { SigninDialog } from '../components/SigninDialog';
import { User } from "@supabase/supabase-js"
import { ThumbnailUploader, HeaderUploader } from '../components/ImageUploader';
import Image from 'next/image';
import Cookies from 'universal-cookie';
import { useCallback } from 'react';

interface props {
    content: JSX.Element,
    detailView?: JSX.Element,
    wannaShowSigninDialog?: boolean
    onStateChanged?: (user: User | null) => void
    closingSigninDialog?: () => void
    header?: JSX.Element
    region?: string
}

const cookies = new Cookies()

export default function PageBase({ content, detailView, wannaShowSigninDialog = false, onStateChanged = () => { }, closingSigninDialog = () => { }, header = <Header />, region = "au" }: props) {
    const styles = useStyles()
    const drawerStyle = drawerStyles()
    const router = useRouter()
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [width, setWidth] = useState(0)
    const [height, setHeight] = useState(0)
    const [user, setUser] = useState<User | null>()

    const [showSetupDialog, openSetupDialog] = useState(false)
    const [name, setName] = useState("")
    const [bio, setBio] = useState("")
    const [localArea, setLocalArea] = useState("")
    const [position, setPosition] = useState("")
    const [setupErrorMsg, setSetupErrorMsg] = useState("")
    const [thumbnail_url, setThumbnailUrl] = useState<string | undefined>("")

    const [showSigninDialog, openSigninDialog] = useState(wannaShowSigninDialog)
    const [signinMode, switchSigninMode] = useState("Sign in")

    const [changingRegion, changeRegion] = useState(false)
    const [showSnackbar, openSnackbar] = useState(false)
    const [snackErrorMsg, setSnackErrorMsg] = useState(null)

    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const isMenuOpen = Boolean(anchorEl);

    useEffect(() => {
        setWidth(window.innerWidth)
        setHeight(window.innerHeight)
        setUser(getUser())
    }, [])

    useEffect(() => {
        if (user == undefined)
            return
        console.log(user)
        if (user) {
            if (cookies.get("user_setup_finished"))
                getSimpleProfile(user.id).then(player => {
                    if (player)
                        setThumbnailUrl(player.thumbnail_url)
                }).catch(error => console.log(error.message))
            else
                checkUserRegisteredAsPlayer(user.id).then(result => {
                    if (result) {
                        cookies.set("user_setup_finished", true)
                        getSimpleProfile(user.id).then(player => {
                            if (player)
                                setThumbnailUrl(player.thumbnail_url)
                        }).catch(error => console.log(error.message))
                    } else {
                        openSetupDialog(true)
                    }
                }).catch(error => {
                    setSnackErrorMsg(error.message)
                    openSnackbar(true)
                })
        }
        onStateChanged(user)
    }, [user])

    const menuId = 'primary-search-account-menu';
    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    function accountMenu() {
        if (getUser()) {
            return (
                <Menu
                    anchorEl={anchorEl}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    id={menuId}
                    keepMounted
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    open={isMenuOpen}
                    onClose={handleMenuClose}
                >
                    <MenuItem onClick={() => {
                        handleMenuClose()
                        router.push({ pathname: "/" + region + "/player", query: { uid: getUser()!.id } })
                    }}>Profile <AccountCircle style={{ marginLeft: 8 }} /></MenuItem>
                    <MenuItem onClick={() => {
                        handleMenuClose()
                        signOut().then(() => {
                            cookies.remove("user_setup_finished")
                            window.location.href = "/" + region
                        })
                    }}>Sign out</MenuItem>
                </Menu>
            )
        } else {
            return (
                <Menu
                    anchorEl={anchorEl}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    id={menuId}
                    keepMounted
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    open={isMenuOpen}
                    onClose={handleMenuClose}
                >
                    <MenuItem onClick={() => {
                        handleMenuClose()
                        switchSigninMode("Sign in")
                        openSigninDialog(true)
                    }}>Sign in</MenuItem>
                    <MenuItem onClick={() => {
                        handleMenuClose()
                        switchSigninMode("Sign up")
                        openSigninDialog(true)
                    }}>Sign up</MenuItem>
                </Menu>
            )
        }
    }

    function playerSetupDialog() {
        if (!getUser())
            return
        switch (region) {
            case "jp":
                return (
                    <Dialog open={showSetupDialog} onClose={() => openSetupDialog(false)} fullScreen>
                        <DialogTitle>プロフィール設定</DialogTitle>
                        <DialogContent>
                            {(setupErrorMsg) ? <Alert severity="error">{setupErrorMsg}</Alert> : null}
                            <Typography variant="h5" >
                                必須項目
                            </Typography>
                            <Typography>
                                これらは設定に最低限必要な情報となります。
                            </Typography>
                            <TextField label="表示名" variant="outlined" className={styles.formTextField} onChange={e => setName(e.target.value)} value={name} fullWidth />
                            <TextField label="説明 (あなた自身について簡単に説明してください)" variant="outlined" className={styles.formTextField} onChange={e => setBio(e.target.value)} value={bio} fullWidth multiline minRows={4} />
                            <Typography variant="h5" style={{ marginTop: 32 }} paragraph>オプション</Typography>
                            <ThumbnailUploader uid={getUser()!.id} region={region} onSuccess={url => setThumbnailUrl(url)} /><br />
                            <HeaderUploader uid={getUser()!.id} region={region} imagePreviewWidth={width * 0.5} />
                            <TextField label="地元" variant="outlined" className={styles.formTextField} onChange={e => setLocalArea(e.target.value)} value={localArea} fullWidth />
                            <TextField label="ポジション" variant="outlined" className={styles.formTextField} onChange={e => setPosition(e.target.value)} defaultValue={position} fullWidth select>
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
                                if (!name) {
                                    setSetupErrorMsg("表示名は必須です")
                                    return
                                }
                                if (!bio) {
                                    setSetupErrorMsg("説明は必須です")
                                    return
                                }
                                addUserToDB(getUser()!.id, name, bio, localArea, position).then(() => {
                                    openSetupDialog(false)
                                    cookies.set("user_setup_finished", true)
                                    onStateChanged(getUser())
                                }).catch(error => setSetupErrorMsg(error.message))
                            }}>完了</Button>
                        </DialogActions>
                    </Dialog>
                )
            default:
                return (
                    <Dialog open={showSetupDialog} onClose={() => openSetupDialog(false)} fullScreen>
                        <DialogTitle>Setup Profile</DialogTitle>
                        <DialogContent>
                            {(setupErrorMsg) ? <Alert severity="error">{setupErrorMsg}</Alert> : null}
                            <Typography variant="h5" >
                                Required
                            </Typography>
                            <Typography>
                                We need these informations at least
                            </Typography>
                            <TextField label="Name" variant="outlined" className={styles.formTextField} onChange={e => setName(e.target.value)} value={name} fullWidth />
                            <TextField label="Bio (Simply describe yourself)" variant="outlined" className={styles.formTextField} onChange={e => setBio(e.target.value)} value={bio} fullWidth multiline minRows={4} />
                            <Typography variant="h5" style={{ marginTop: 32 }} paragraph>Optional</Typography>
                            <ThumbnailUploader uid={getUser()!.id} region={region} onSuccess={url => setThumbnailUrl(url)} /><br />
                            <HeaderUploader uid={getUser()!.id} region={region} imagePreviewWidth={width * 0.5} />
                            <TextField label="Local area" variant="outlined" className={styles.formTextField} onChange={e => setLocalArea(e.target.value)} value={localArea} fullWidth />
                            <TextField label="Position" variant="outlined" className={styles.formTextField} onChange={e => setPosition(e.target.value)} defaultValue={position} fullWidth select>
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
                                if (!name) {
                                    setSetupErrorMsg("Name is required")
                                    return
                                }
                                if (!bio) {
                                    setSetupErrorMsg("Bio is required")
                                    return
                                }
                                addUserToDB(getUser()!.id, name, bio, localArea, position).then(() => {
                                    openSetupDialog(false)
                                    cookies.set("user_setup_finished", true)
                                    onStateChanged(getUser())
                                }).catch(error => setSetupErrorMsg(error.message))
                            }}>Done</Button>
                        </DialogActions>
                    </Dialog>
                )
        }
    }

    function renderDesktopNavMenu() {
        switch (region) {
            case "jp":
                return <div style={{ width: "25%", alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
                    <Typography style={{ backgroundColor: defaultTheme, width: "90%", height: 50, color: darkerTextColor, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 25, marginTop: 16 }} variant="h5" onClick={() => router.push("/" + region)}>
                        ホーム <Home style={{ marginLeft: 8, width: 40, height: 30, color: goldColor }} />
                    </Typography>
                    <Typography style={{ backgroundColor: defaultTheme, width: "90%", height: 50, color: darkerTextColor, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 25, marginTop: 16 }} variant="h5" onClick={() => router.push("/" + region + "/games")}>
                        ゲーム <SportsSoccerTwoTone style={{ marginLeft: 8, width: 40, height: 30, color: goldColor }} />
                    </Typography>
                    <Typography style={{ backgroundColor: defaultTheme, width: "90%", height: 50, color: darkerTextColor, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 25, marginTop: 16 }} variant="h5" onClick={() => router.push("/" + region + "/tournaments")}>
                        トーナメント <EmojiEventsTwoTone style={{ marginLeft: 8, width: 40, height: 30, color: goldColor }} />
                    </Typography>
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", color: "white", marginTop: 16 }}>
                        ©️ AIZero Inc. 2021     国: {(changingRegion) ? <CircularProgress /> : <TextField onChange={e => {
                            changeRegion(true)
                            router.push("../" + e.target.value)
                        }} value={region} select style={{ marginLeft: 8, backgroundColor: "silver" }} >
                            {regions.map(region => (
                                <MenuItem key={region.key} value={region.value}>{region.label}</MenuItem>
                            ))}
                        </TextField>}
                    </div>
                </div>
                break;
            default:
                return <div style={{ width: "25%", alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
                    <Typography style={{ backgroundColor: defaultTheme, width: "90%", height: 50, color: darkerTextColor, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 25, marginTop: 16 }} variant="h5" onClick={() => router.push("/" + region)}>
                        Home <Home style={{ marginLeft: 8, width: 40, height: 30, color: goldColor }} />
                    </Typography>
                    <Typography style={{ backgroundColor: defaultTheme, width: "90%", height: 50, color: darkerTextColor, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 25, marginTop: 16 }} variant="h5" onClick={() => router.push("/" + region + "/games")}>
                        Games <SportsSoccerTwoTone style={{ marginLeft: 8, width: 40, height: 30, color: goldColor }} />
                    </Typography>
                    <Typography style={{ backgroundColor: defaultTheme, width: "90%", height: 50, color: darkerTextColor, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 25, marginTop: 16 }} variant="h5" onClick={() => router.push("/" + region + "/tournaments")}>
                        Tournaments <EmojiEventsTwoTone style={{ marginLeft: 8, width: 40, height: 30, color: goldColor }} />
                    </Typography>
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", color: "white", marginTop: 16 }}>
                        ©️ AIZero Inc. 2021     Region: {(changingRegion) ? <CircularProgress /> : <TextField onChange={e => {
                            changeRegion(true)
                            router.push("../" + e.target.value)
                        }} value={region} select style={{ marginLeft: 8, backgroundColor: "silver" }} >
                            {regions.map(region => (
                                <MenuItem key={region.key} value={region.value}>{region.label}</MenuItem>
                            ))}
                        </TextField>}
                    </div>
                </div>
        }
    }
    if (isMobile) {
        return (
            <div className={styles.root} style={{ overflow: "hidden" }}>
                {header}
                <AppBar position="fixed" >
                    <Toolbar>
                        <Link href="/" color="inherit">
                            <Typography variant="h6" style={{ color: darkerTextColor }} noWrap>{appName}</Typography>
                        </Link>
                        <div className={styles.grow} />
                        <IconButton
                            edge="end"
                            aria-label="account of current user"
                            aria-controls={menuId}
                            aria-haspopup="true"
                            onClick={e => setAnchorEl(e.currentTarget)}
                            color="inherit"
                        >
                            {(thumbnail_url) ? <Image src={thumbnail_url} width={36} height={36} className={styles.thumbnailCircle36} alt={"account thumbnail"} /> : <AccountCircle style={{ width: 36, height: 36, borderRadius: 12 }} />}
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <div style={{ display: "flex", flexDirection: "column", width: "100%", height: height, overflow: "hidden" }}>
                    <main style={{ backgroundColor: defaultTheme, width: "100%", overflow: "scroll" }}>
                        <div className={styles.drawerHeader} />
                        <SigninDialog show={showSigninDialog || wannaShowSigninDialog} region={region} mode={signinMode} signedIn={user => {
                            openSigninDialog(false)
                            closingSigninDialog()
                        }} onClose={() => {
                            openSigninDialog(false)
                            closingSigninDialog()
                        }} />
                        <div style={{ height: 5 }} />
                        {content}
                    </main>
                    <BottomNavigation
                        value={selectedIndex}
                        onChange={(e, value) => {
                            setSelectedIndex(value)
                            router.push("/" + region + "/" + value)
                        }}
                        showLabels
                        style={{ backgroundColor: 'white', width: "100%", borderColor: backgroundTheme, borderWidth: 1, borderStyle: "solid" }}
                    >
                        <BottomNavigationAction label="Home" icon={<Home style={{ color: goldColor }} />} value="/" style={{ color: darkerTextColor }} />
                        <BottomNavigationAction label="Games" icon={<SportsSoccerTwoTone style={{ color: goldColor }} />} value="games" style={{ color: darkerTextColor }} />
                        <BottomNavigationAction label="Tournament" icon={<EmojiEventsTwoTone style={{ color: goldColor }} />} value="tournaments" style={{ color: darkerTextColor }} />
                        <BottomNavigationAction label="Search" icon={<Search style={{ color: goldColor }} />} value="search" style={{ color: darkerTextColor }} />
                    </BottomNavigation>
                </div>
                <Snackbar open={showSnackbar} autoHideDuration={6000} onClose={() => openSnackbar(false)}>
                    <Alert onClose={() => openSnackbar(false)} severity="error">{snackErrorMsg}</Alert>
                </Snackbar>
                {playerSetupDialog()}
                {accountMenu()}
            </div>
        )
    } else {
        return (
            <div className={styles.root}>
                {header}
                <AppBar position="fixed" className={drawerStyle.appBar}>
                    <Toolbar>
                        <Link href="/" color="inherit">
                            <Typography variant="h6" style={{ color: darkerTextColor }} noWrap>{appName}</Typography>
                        </Link>
                        <div className={styles.grow} />
                        <IconButton
                            edge="end"
                            aria-label="account of current user"
                            aria-controls={menuId}
                            aria-haspopup="true"
                            onClick={e => setAnchorEl(e.currentTarget)}
                            color="inherit"
                        >
                            {(thumbnail_url) ? <Image src={thumbnail_url} width={36} height={36} className={styles.thumbnailCircle36} alt={"account thumbnail"} /> : <AccountCircle style={{ width: 36, height: 36, borderRadius: 12 }} />}
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <main style={{ width: width, display: 'flex', flexDirection: 'column' }}>
                    <div className={styles.drawerHeader} />
                    <SigninDialog show={showSigninDialog || wannaShowSigninDialog} region={region} mode={signinMode} signedIn={user => {
                        openSigninDialog(false)
                        closingSigninDialog()
                    }} onClose={() => {
                        openSigninDialog(false)
                        closingSigninDialog()
                    }} />
                    <div style={{ display: "flex" }}>
                        {renderDesktopNavMenu()}
                        <div style={{ width: "50%", height: height - 70, borderColor: defaultTheme, borderWidth: 1, borderStyle: "solid", background: defaultTheme, overflow: "scroll" }}>
                            {content}
                        </div>
                        <div style={{ width: "25%", display: 'flex', flexDirection: 'column', overflow: "scroll" }}>
                            {detailView}
                        </div>
                    </div>
                </main>
                <Snackbar open={showSnackbar} autoHideDuration={6000} onClose={() => openSnackbar(false)}>
                    <Alert onClose={() => openSnackbar(false)} severity="error">{snackErrorMsg}</Alert>
                </Snackbar>
                {playerSetupDialog()}
                {accountMenu()}
            </div >
        )
    }
}