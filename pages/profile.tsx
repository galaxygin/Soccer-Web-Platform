import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Menu, MenuItem, Snackbar, TextField, Typography } from "@material-ui/core";
import React, { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { getProfile, updateProfile } from "../api/request/UserRequest";
import { Player } from "../Definitions";
import PageBase from "./PageBase";
import Image from 'next/image'
import { darkerTextColor, defaultTheme, useStyles } from "../public/assets/styles/styles.web";
import { useRouter } from "next/router";
import { AccountCircle, Close, Done, Edit } from "@material-ui/icons";
import { Alert } from "@material-ui/lab";
import { updateThumbnail } from "../components/UserDataManager";

export default function Profile() {
    const styles = useStyles()
    const router = useRouter()
    const [player, setPlayer] = useState<Player | null>(null)
    const [cookies, setCookie, removeCookie] = useCookies(['uid'])
    const [loading, setLoading] = useState(true)
    const [width, setWidth] = useState(0)
    const [showSnackbar, openSnackbar] = useState(false)

    const [editingProfile, changingProfile] = useState(false)
    const [name, setName] = useState("")
    const [bio, setBio] = useState("")
    const [position, setPosition] = useState("Anywhere")
    const [localArea, setLocalArea] = useState<string | null>("")
    const [thumbnail_url, setThumbnailUrl] = useState<string | null>('')
    const [profileErrorMsg, setProfileErrorMsg] = useState(null)

    const [changeThumb, changingThumb] = useState(false)
    const [newThumb, setNewThumb] = useState<File | null>(null)
    const [thumbLoading, setThumbLoading] = useState(false)
    const [errorThumbMsg, setErrorThumbMsg] = useState(null)

    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const isMenuOpen = Boolean(anchorEl);

    useEffect(() => {
        setWidth(window.innerWidth)
        if (router.query.uid) {
            updateInfo()
            return
        }
        setLoading(false)
    }, [])

    function updateInfo() {
        getProfile(router.query.uid as string).then(player => {
            if (player) {
                setPlayer(player)
                setName(player.name)
                setBio(player.bio)
                setPosition(player.position)
                setLocalArea(player.localArea)
                setThumbnailUrl(player.thumbnailUrl)
            }
        }).catch(error => console.log(error.message)).finally(() => setLoading(false))
    }

    const menuId = 'primary-search-account-menu';
    const renderMenu = (
        <Menu
            anchorEl={anchorEl}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            id={menuId}
            keepMounted
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={isMenuOpen}
            onClose={e => setAnchorEl(null)}
        >
            <MenuItem onClick={() => {
                setAnchorEl(null)
                changingThumb(true)
            }}>Update thumbnail</MenuItem>
        </Menu>
    );

    function pickImage(event: React.ChangeEvent<HTMLInputElement>) {
        if (event.target.files && event.target.files[0]) {
            setNewThumb(event.target.files[0])
        }
    }

    function isMyAccount(): boolean {
        return router.query.uid == cookies.uid
    }

    function editButton() {
        if (isMyAccount()) {
            if (editingProfile)
                return <div>
                    <IconButton onClick={() => changingProfile(false)} style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: "red", color: "white" }}><Close /></IconButton>
                    <IconButton onClick={() => updateProfile(cookies.uid, name, bio, position, localArea).then(() => { updateInfo(); changingProfile(false) }).catch(error => { setProfileErrorMsg(error.message); openSnackbar(true) })} style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: "green", color: "white" }}><Done /></IconButton>
                </div>
            else
                return <IconButton onClick={() => changingProfile(true)} style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: "gray", color: "white" }}><Edit /></IconButton>
        }
    }

    function content() {
        if (loading) {
            return (
                <div style={{ display: "flex", flexDirection: 'column', justifyContent: "center", alignItems: "center", width: "100%", height: "100%" }}>
                    <CircularProgress style={{ color: darkerTextColor }} />
                </div >
            )
        }
        if (player) {
            return (
                <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <Dialog open={changeThumb} onClose={() => {
                        setNewThumb(null)
                        changingThumb(false)
                    }} fullWidth>
                        <DialogTitle style={{ backgroundColor: '#454545', color: 'white' }}>Change Thumbnail</DialogTitle>
                        <DialogContent style={{ backgroundColor: '#454545', color: 'white' }}>
                            {(errorThumbMsg) ? <Alert severity="error" style={{ marginBottom: 8 }}>{errorThumbMsg}</Alert> : null}
                            <input type="file" onChange={pickImage} className="filetype" accept="image/*" id="group_image" /><br />
                        </DialogContent>
                        <DialogActions style={{ backgroundColor: '#454545', color: 'white' }}>
                            {(thumbLoading) ? <CircularProgress style={{ color: 'white' }} /> : <Button disabled={!newThumb} variant="contained" onClick={() => {
                                setThumbLoading(true)
                                updateThumbnail(cookies.uid, newThumb!).then(url => {
                                    setThumbnailUrl(url)
                                    changingThumb(false)
                                }).catch(error => {
                                    setErrorThumbMsg(error.message)
                                }).finally(() => setThumbLoading(false))
                            }} color="primary" style={{ margin: 16, backgroundColor: 'red' }}>
                                Update
                            </Button>}
                        </DialogActions>
                    </Dialog>
                    <Image src={"/assets/images/SoccerFieldLandscape.jpg"} width={width * 0.5} height={350} />
                    <div style={{ backgroundColor: defaultTheme, height: "100%", borderColor: "white", borderWidth: 1, borderStyle: "solid" }}>
                        <div style={{ display: "flex", flexDirection: "row" }}>
                            <IconButton
                                edge="end"
                                aria-label="Thumbnail of the player"
                                aria-haspopup="true"
                                onClick={e => { if (isMyAccount()) setAnchorEl(e.currentTarget) }}
                                color="inherit"
                            >
                                {(thumbnail_url) ? <img src={thumbnail_url} width={100} height={100} style={{ borderRadius: 50 }} /> : <AccountCircle style={{ width: 100, height: 100, borderRadius: 50 }} />}
                            </IconButton>
                            {(editingProfile) ? <div style={{ display: "flex", height: 100, padding: 10, flexDirection: "column" }}>
                                <TextField label="Name" variant="outlined" className={styles.formTextField} onChange={e => setName(e.target.value)} value={name} style={{ marginTop: 0 }} />
                                <TextField label="Position" variant="outlined" className={styles.formTextField} onChange={e => setPosition(e.target.value)} defaultValue={position} select>
                                    <MenuItem key={""} value={""}>Anywhere</MenuItem>
                                    <MenuItem key={"GK"} value={"GK"}>GK</MenuItem>
                                    <MenuItem key={"CB"} value={"CB"}>CB</MenuItem>
                                    <MenuItem key={"SB"} value={"SB"}>SB</MenuItem>
                                    <MenuItem key={"MF"} value={"MF"}>MF</MenuItem>
                                    <MenuItem key={"CF"} value={"CF"}>CF</MenuItem>
                                    <MenuItem key={"LW"} value={"LW"}>LW</MenuItem>
                                    <MenuItem key={"RW"} value={"RW"}>RW</MenuItem>
                                </TextField>
                            </div> : <div style={{ display: "flex", height: 100, padding: 10, flexDirection: "column" }}>
                                <Typography variant="h4" style={{ color: darkerTextColor }}>
                                    {player.name}
                                </Typography>
                                <Typography style={{ color: darkerTextColor }}>
                                    Position: {player.position}<br />
                                    Local area: {player.localArea}
                                </Typography>
                            </div>}
                            <div style={{ flexGrow: 1 }} />
                            {editButton()}
                        </div>
                        {(editingProfile) ? <div>
                            <TextField label="Bio" variant="outlined" className={styles.formTextField} onChange={e => setBio(e.target.value)} value={bio} fullWidth multiline minRows={4} />
                            <TextField label="Local area" variant="outlined" className={styles.formTextField} onChange={e => setLocalArea(e.target.value)} value={localArea} />
                        </div> :
                            <Typography style={{ color: darkerTextColor, padding: 16 }}>
                                {player.bio}<br /><br />
                            </Typography>}
                    </div>
                    <Snackbar open={showSnackbar} autoHideDuration={6000} onClose={() => openSnackbar(false)}>
                        <Alert onClose={() => openSnackbar(false)} severity="error">{profileErrorMsg}</Alert>
                    </Snackbar>
                    {renderMenu}
                </div >
            )
        } else {
            return (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", paddingTop: 20 }}>
                    <Typography style={{ color: darkerTextColor }}>
                        Couldn't get Player profile
                    </Typography>
                </div >
            )
        }
    }

    return <PageBase content={content()} />
}