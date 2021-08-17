import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router'
import { Link, MenuItem, IconButton, Menu, AppBar, Toolbar, Typography, BottomNavigation, BottomNavigationAction, Dialog, Button, DialogActions, DialogContent, DialogTitle, TextField, CircularProgress, Snackbar } from '@material-ui/core';
import { AccountCircle, EmojiEventsTwoTone, Home, Search, SportsSoccerTwoTone, Close } from '@material-ui/icons';
import Header from './Header';
import { backgroundTheme, darkerTextColor, defaultTheme, drawerStyles, goldColor, themeColor, useStyles } from '../public/assets/styles/styles.web';
import { appName } from '../Definitions';
import { isMobile } from 'react-device-detect'
import { addUserToDB, getUser, signInWithEmail, signInWithGoogle, signOut, signUp } from '../api/request/AuthRequest';
import { checkUserRegisteredAsPlayer, getProfile, uploadThumbnail } from '../api/request/UserRequest';
import { Alert } from '@material-ui/lab';
import { useCookies } from 'react-cookie';

interface props {
    content: JSX.Element,
    detailView?: JSX.Element,
    wannaShowSigninDialog?: boolean
    header?: JSX.Element
}

export default function PageBase({ content, detailView, wannaShowSigninDialog = false, header = <Header /> }: props) {
    const styles = useStyles()
    const drawerStyle = drawerStyles()
    const router = useRouter()
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [thumbnail_url, setThumbnailUrl] = useState<string | null>(null)
    const [width, setWidth] = useState(0)
    const [height, setHeight] = useState(0)
    const [cookies, setCookie, removeCookie] = useCookies(['uid'])

    const [showSetupDialog, openSetupDialog] = useState(false)
    const [name, setName] = useState("")
    const [bio, setBio] = useState("")
    const [localArea, setLocalArea] = useState("")
    const [position, setPosition] = useState("")
    const [setupErrorMsg, setSetupErrorMsg] = useState("")
    const [newThumb, setNewThumb] = useState<File | null>(null)
    const [thumbLoading, setThumbLoading] = useState(false)
    const [errorThumbMsg, setErrorThumbMsg] = useState(null)

    const [showSigninDialog, openSigninDialog] = useState(false)
    const [authSuccessMsg, setAuthSuccessMsg] = useState("")
    const [authErrorMsg, setAuthErrorMsg] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPW, setConfirmPW] = useState("")
    const [myWindow, setWindow] = useState<Window | null>(null)
    const [signinMode, switchSigninMode] = useState("Sign in")

    const [showSnackbar, openSnackbar] = useState(false)
    const [snackErrorMsg, setSnackErrorMsg] = useState(null)

    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const isMenuOpen = Boolean(anchorEl);

    useEffect(() => {
        if (getUser())
            checkUserRegisteredAsPlayer(cookies.uid).then(result => {
                if (result)
                    getProfile(cookies.uid).then(player => {
                        if (player)
                            setThumbnailUrl(player.thumbnail_url)
                    }).catch(error => console.log(error.message))
                else {
                    openSetupDialog(true)
                }
            }).catch(error => {
                setSnackErrorMsg(error.message)
                openSnackbar(true)
            })
        setWidth(window.innerWidth)
        setHeight(window.innerHeight)
        setWindow(window)
    }, [])

    useEffect(() => {
        console.log(getUser())
    }, [getUser()])

    const menuId = 'primary-search-account-menu';
    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    function googleSignIn() {
        signInWithGoogle().then(user => {
            setCookie('uid', user.id)
            getProfile(user.id).then(player => {
                if (!player)
                    openSetupDialog(true)
                else
                    window.location.reload()
            })
        }).catch(error => setAuthErrorMsg(error.message))
    }

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
                        router.push({ pathname: "profile", query: { uid: cookies.uid } })
                    }}>Profile <AccountCircle style={{ marginLeft: 8 }} /></MenuItem>
                    <MenuItem onClick={() => {
                        handleMenuClose()
                        signOut().then(() => {
                            removeCookie("uid")
                            window.location.href = "/"
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

    function pickImage(event: React.ChangeEvent<HTMLInputElement>) {
        if (event.target.files && event.target.files[0]) {
            // const fileReader: FileReader = new myWindow.FileReader()
            // fileReader.onload = async (e: Event) => { }
            // fileReader.readAsArrayBuffer(event.target.files[0]);
            setNewThumb(event.target.files[0])
        }
    }

    function playerSetupDialog() {
        return (
            <Dialog open={showSetupDialog} onClose={() => openSetupDialog(false)} fullScreen>
                <DialogTitle>Setup Profile</DialogTitle>
                <DialogContent>
                    {(setupErrorMsg) ? <Alert severity="error">{setupErrorMsg}</Alert> : null}
                    <Typography variant="h5" style={{ marginTop: 16 }}>
                        Required
                    </Typography>
                    <Typography>
                        We need these informations at least
                    </Typography>
                    <TextField label="Name" variant="outlined" className={styles.formTextField} onChange={e => setName(e.target.value)} value={name} fullWidth />
                    <TextField label="Bio (Simply describe yourself)" variant="outlined" className={styles.formTextField} onChange={e => setBio(e.target.value)} value={bio} fullWidth multiline minRows={4} />
                    <Typography variant="h5" style={{ marginTop: 16 }} paragraph>Optional</Typography>
                    <Typography>Thumbnail</Typography>
                    {(errorThumbMsg) ? <Alert severity="error" style={{ marginBottom: 8 }}>{errorThumbMsg}</Alert> : null}
                    <input type="file" onChange={pickImage} className="filetype" accept="image/*" id="group_image" />{(thumbLoading) ? <CircularProgress style={{ color: 'white' }} /> : <Button disabled={!newThumb} variant="outlined" onClick={() => {
                        setThumbLoading(true)
                        uploadThumbnail(cookies.uid, newThumb!).then(url => {
                            setThumbnailUrl(url)
                        }).catch(error => {
                            setErrorThumbMsg(error.message)
                        }).finally(() => setThumbLoading(false))
                    }} color="primary" style={{ margin: 16, backgroundColor: 'red' }}>
                        Upload
                    </Button>}<br />
                    {(thumbnail_url) ? <img src={thumbnail_url} width={100} height={100} alt={""} /> : null}
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
                        addUserToDB(cookies.uid, name, bio, thumbnail_url, localArea, position).then(() => {
                            openSetupDialog(false)
                            window.location.reload()
                        }).catch(error => setSetupErrorMsg(error.message))
                    }}>Done</Button>
                </DialogActions>
            </Dialog>
        )
    }

    function signinDialog() {
        if (signinMode == "Sign in") {
            return (
                <Dialog open={showSigninDialog} onClose={() => {
                    openSigninDialog(false)
                }}>
                    <DialogTitle style={{ backgroundColor: '#454545', color: 'white' }}>
                        Sign in
                    </DialogTitle>
                    <DialogContent style={{ backgroundColor: '#454545' }}>
                        {(authErrorMsg) ? <div style={{ alignItems: 'center', justifyContent: 'center', display: 'flex', margin: 16 }}><Alert severity="error">Error: {authErrorMsg}</Alert></div> : null}
                        <div style={{ alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
                            <Button onClick={() => googleSignIn()}>
                                <img src={'./assets/images/google_signin.png'} height={60} alt={"Google Signin"} />
                            </Button>
                        </div>
                        <div style={{ marginTop: 32 }}>
                            <TextField onChange={e => setEmail(e.target.value)} label="Email" required variant="filled" style={{ backgroundColor: 'white' }} fullWidth />
                        </div>
                        <div style={{ marginTop: 8 }}>
                            <TextField onChange={e => setPassword(e.target.value)} type={'password'} label="Password" required variant="filled" style={{ backgroundColor: 'white' }} fullWidth />
                        </div>
                        <Typography align={"center"} style={{ margin: 16 }} paragraph>
                            <Button variant="contained" onClick={() => signInWithEmail(email, password).then(user => {
                                setCookie('uid', user.id)
                                myWindow!.location.reload()
                            }).catch(error => setAuthErrorMsg(error.message))} style={{ margin: 16, backgroundColor: 'white' }}>
                                Sign in
                            </Button><br /><br />
                            <a href="forgot-password" style={{ color: 'aqua' }}>Forgot password</a>
                        </Typography>
                        <Typography align={"center"} style={{ color: 'white', marginTop: 16 }} >
                            You can create an account if you don't have one<br />
                            <Button variant="contained" onClick={() => switchSigninMode("Sign up")} color="primary" style={{ margin: 16 }}>
                                Sign up
                            </Button>
                        </Typography>
                    </DialogContent>
                    <DialogActions style={{ backgroundColor: "#454545" }}>
                        <IconButton onClick={() => {
                            openSigninDialog(false)
                        }}>
                            <Close style={{ color: "red" }} />
                        </IconButton>
                        <div style={{ flexGrow: 1 }} />
                    </DialogActions>
                </Dialog >
            )
        } else {
            return (
                <Dialog open={showSigninDialog} onClose={() => {
                    openSigninDialog(false)
                }}>
                    <DialogTitle style={{ backgroundColor: '#454545', color: 'white' }}>Sign up</DialogTitle>
                    <DialogContent style={{ backgroundColor: '#454545' }}>
                        {(authSuccessMsg) ? <div style={{ alignItems: 'center', justifyContent: 'center', display: 'flex', margin: 16 }}><Alert severity="success">{authSuccessMsg}</Alert></div> : null}
                        {(authErrorMsg) ? <div style={{ alignItems: 'center', justifyContent: 'center', display: 'flex', margin: 16 }}><Alert severity="error">Error: {authErrorMsg}</Alert></div> : null}
                        <div style={{ alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
                            <Button onClick={() => googleSignIn()}>
                                <img src={'./assets/images/google_signin.png'} height={60} alt={"Google Signin"} />
                            </Button>
                        </div>
                        <div style={{ marginTop: 32 }}>
                            <TextField onChange={e => setEmail(e.target.value)} label="Email" required variant="filled" style={{ backgroundColor: 'white' }} fullWidth />
                        </div>
                        <div style={{ marginTop: 8 }}>
                            <TextField onChange={e => setPassword(e.target.value)} type={'password'} label="Password" required variant="filled" style={{ backgroundColor: 'white' }} fullWidth />
                        </div>
                        <div style={{ marginTop: 8 }}>
                            <TextField onChange={e => setConfirmPW(e.target.value)} type={'password'} label="Confirm" required variant="filled" style={{ backgroundColor: 'white' }} fullWidth />
                        </div>
                        <Typography align={"center"} style={{ margin: 16 }} paragraph>
                            <Button variant="contained" onClick={() => {
                                if (email == "") {
                                    setAuthErrorMsg("Email is not filled")
                                    return
                                }
                                if (password != confirmPW) {
                                    setAuthErrorMsg("Password doesn't match")
                                    return
                                }
                                if (password.length < 8) {
                                    setAuthErrorMsg("Password length must be more than 8 characters")
                                    return
                                }
                                signUp(email, password).then(user => {
                                    if (user.id) {
                                        setCookie('uid', user.id)
                                        setAuthSuccessMsg("Sign up success. Please confirm your enail first")
                                    }
                                }).catch(error => setAuthErrorMsg(error.message))
                            }} style={{ margin: 16, backgroundColor: 'white' }}>
                                Sign up
                            </Button>
                        </Typography>
                        <Typography align={"center"} style={{ color: 'white', marginTop: 16 }} >
                            You can sign in if you already have an account<br />
                            <Button variant="contained" onClick={() => switchSigninMode("Sign in")} color="primary" style={{ margin: 16 }}>
                                Sign in
                            </Button>
                        </Typography>
                    </DialogContent>
                    <DialogActions style={{ backgroundColor: "#454545" }}>
                        <IconButton onClick={() => {
                            openSigninDialog(false)
                        }}>
                            <Close style={{ color: "red" }} />
                        </IconButton>
                        <div style={{ flexGrow: 1 }} />
                    </DialogActions>
                </Dialog>
            )
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
                            {(thumbnail_url) ? <img src={thumbnail_url} width={36} height={36} style={{ borderRadius: 18 }} /> : <AccountCircle style={{ width: 36, height: 36, borderRadius: 12 }} />}
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <div style={{ display: "flex", flexDirection: "column", width: "100%", height: height, overflow: "hidden" }}>
                    <main style={{ backgroundColor: defaultTheme, width: "100%", overflow: "scroll" }}>
                        <div className={styles.drawerHeader} />
                        {signinDialog()}
                        <div style={{ height: 5 }} />
                        {content}
                    </main>
                    <BottomNavigation
                        value={selectedIndex}
                        onChange={(e, value) => {
                            setSelectedIndex(value)
                            router.push(value)
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
                            {(thumbnail_url) ? <img src={thumbnail_url} width={36} height={36} style={{ borderRadius: 18 }} /> : <AccountCircle style={{ width: 36, height: 36, borderRadius: 12 }} />}
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <main style={{ width: width, display: 'flex', flexDirection: 'column' }}>
                    <div className={styles.drawerHeader} />
                    {signinDialog()}
                    <div style={{ display: "flex", overflow: "scroll" }}>
                        <div style={{ width: "25%", alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
                            <Typography style={{ backgroundColor: defaultTheme, width: "90%", height: 50, color: darkerTextColor, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 25, marginTop: 16 }} variant="h5" onClick={() => router.push("/")}>
                                Home <Home style={{ marginLeft: 8, width: 40, height: 30, color: goldColor }} />
                            </Typography>
                            <Typography style={{ backgroundColor: defaultTheme, width: "90%", height: 50, color: darkerTextColor, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 25, marginTop: 16 }} variant="h5" onClick={() => router.push("games")}>
                                Games <SportsSoccerTwoTone style={{ marginLeft: 8, width: 40, height: 30, color: goldColor }} />
                            </Typography>
                            <Typography style={{ backgroundColor: defaultTheme, width: "90%", height: 50, color: darkerTextColor, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 25, marginTop: 16 }} variant="h5" onClick={() => router.push("tournaments")}>
                                Tournament <EmojiEventsTwoTone style={{ marginLeft: 8, width: 40, height: 30, color: goldColor }} />
                            </Typography>
                            <Typography style={{ backgroundColor: defaultTheme, width: "90%", height: 50, color: darkerTextColor, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 25, marginTop: 16 }} variant="h5" onClick={() => router.push("search")}>
                                Search <Search style={{ marginLeft: 8, width: 40, height: 30, color: goldColor }} />
                            </Typography>
                        </div>
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
            </div>
        )
    }
}