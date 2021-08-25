import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Menu, MenuItem, Snackbar, TextField, Typography } from "@material-ui/core";
import React, { useState, useEffect } from "react";
import { getProfile, updateProfile } from "../../api/request/UserRequest";
import { landscapeFieldImgURI, Player } from "../../Definitions";
import PageBase from "../PageBase";
import Image from 'next/image'
import { darkerTextColor, defaultTheme, useStyles } from "../../public/assets/styles/styles.web";
import { useRouter } from "next/router";
import { AccountCircle, Close, Done, Edit, LockTwoTone } from "@material-ui/icons";
import { Alert } from "@material-ui/lab";
import { updateHeader, updateThumbnail } from "../../components/UserDataManager";
import { User } from "@supabase/supabase-js";

export default function PlayerView() {
    const styles = useStyles()
    const router = useRouter()
    const [player, setPlayer] = useState<Player | null>(null)
    const [user, setUser] = useState<User | null>()
    const [loading, setLoading] = useState(true)
    const [width, setWidth] = useState(0)
    const [height, setHeight] = useState(0)
    const [showSnackbar, openSnackbar] = useState(false)

    const [editingProfile, changingProfile] = useState(false)
    const [name, setName] = useState("")
    const [bio, setBio] = useState("")
    const [position, setPosition] = useState("Anywhere")
    const [localArea, setLocalArea] = useState<string | null>("")
    const [thumbnail_url, setThumbnailUrl] = useState<string | null>('')
    const [header_url, setHeaderUrl] = useState<string>()
    const [visibility, setVisibility] = useState("public")
    const [profileErrorMsg, setProfileErrorMsg] = useState(null)

    const [changeThumb, changingThumb] = useState(false)
    const [newThumb, setNewThumb] = useState<File>()
    const [thumbLoading, setThumbLoading] = useState(false)
    const [errorThumbMsg, setErrorThumbMsg] = useState(null)

    const [changeHeader, changingHeader] = useState(false)
    const [newHeader, setNewHeader] = useState<File>()
    const [headerLoading, setHeaderLoading] = useState(false)
    const [errorHeaderMsg, setErrorHeaderMsg] = useState(null)

    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const isMenuOpen = Boolean(anchorEl);

    const [headerAnchorEl, setHeaderAnchorEl] = useState<HTMLElement | null>(null);
    const isHeaderMenuOpen = Boolean(headerAnchorEl);

    useEffect(() => {
        setWidth(window.innerWidth)
        setHeight(window.innerHeight)
    }, [])

    useEffect(() => {
        if (router.query.uid) {
            updateInfo()
            return
        }
        setLoading(false)
    }, [router.query.uid])

    function updateInfo() {
        getProfile(router.query.uid as string).then(player => {
            if (player) {
                setPlayer(player)
                setName(player.name)
                setBio(player.bio)
                setPosition(player.position)
                setLocalArea(player.local_area)
                setThumbnailUrl(player.thumbnail_url)
                setHeaderUrl(player.header_url)
                setVisibility((player.is_private) ? "private" : "public")
            }
        }).catch(error => console.log(error.message)).finally(() => setLoading(false))
    }

    function pickImage(event: React.ChangeEvent<HTMLInputElement>, mode: string) {
        if (event.target.files && event.target.files[0]) {
            switch (mode) {
                case "thumbnail":
                    setNewThumb(event.target.files[0])
                    break
                case "header":
                    setNewHeader(event.target.files[0])
            }
        }
    }

    function isMyAccount(): boolean {
        return router.query.uid == user?.id
    }

    function editButton() {
        if (isMyAccount()) {
            if (editingProfile)
                return <div style={{ display: 'flex', flexDirection: "row" }}>
                    <IconButton onClick={() => changingProfile(false)} style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: "red", color: "white" }}><Close /></IconButton>
                    <div style={{ flexGrow: 1 }} />
                    <IconButton onClick={() => updateProfile(user!.id, name, bio, position, localArea, visibility).then(() => { updateInfo(); changingProfile(false) }).catch(error => { setProfileErrorMsg(error.message); openSnackbar(true) })} style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: "green", color: "white" }}><Done /></IconButton>
                </div>
            else
                return <IconButton onClick={() => changingProfile(true)} style={{ width: 50, height: 50, borderRadius: 25, marginRight: 16, backgroundColor: "green", color: "white", alignSelf: "start" }}><Edit /></IconButton>
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
                <div style={{ display: "flex", flexDirection: "column", height: height - 115 }}>
                    <Menu
                        anchorEl={anchorEl}
                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                        id={"thumbnail_menu"}
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
                    <Menu
                        anchorEl={headerAnchorEl}
                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                        id={"header_menu"}
                        keepMounted
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                        open={isHeaderMenuOpen}
                        onClose={e => setHeaderAnchorEl(null)}
                    >
                        <MenuItem onClick={() => {
                            setHeaderAnchorEl(null)
                            changingHeader(true)
                        }}>Update header</MenuItem>
                    </Menu>
                    <Dialog open={changeThumb} onClose={() => {
                        setNewThumb(undefined)
                        changingThumb(false)
                    }} fullWidth>
                        <DialogTitle style={{ backgroundColor: '#454545', color: 'white' }}>Change Thumbnail</DialogTitle>
                        <DialogContent style={{ backgroundColor: '#454545', color: 'white' }}>
                            {(errorThumbMsg) ? <Alert severity="error" style={{ marginBottom: 8 }}>{errorThumbMsg}</Alert> : null}
                            <input type="file" onChange={e => pickImage(e, "thumbnail")} className="filetype" accept="image/*" id="group_image" /><br />
                        </DialogContent>
                        <DialogActions style={{ backgroundColor: '#454545', color: 'white' }}>
                            {(thumbLoading) ? <CircularProgress style={{ color: 'white' }} /> : <Button disabled={!newThumb} variant="outlined" onClick={() => {
                                setThumbLoading(true)
                                updateThumbnail(user!.id, newThumb!).then(url => {
                                    setThumbnailUrl(url)
                                    changingThumb(false)
                                }).catch(error => {
                                    setErrorThumbMsg(error.message)
                                }).finally(() => setThumbLoading(false))
                            }} color="primary" style={{ margin: 16, backgroundColor: 'red', color: "white" }}>
                                Update
                            </Button>}
                        </DialogActions>
                    </Dialog>
                    <Dialog open={changeHeader} onClose={() => {
                        setNewHeader(undefined)
                        changingHeader(false)
                    }} fullWidth>
                        <DialogTitle style={{ backgroundColor: '#454545', color: 'white' }}>Change Header</DialogTitle>
                        <DialogContent style={{ backgroundColor: '#454545', color: 'white' }}>
                            {(errorHeaderMsg) ? <Alert severity="error" style={{ marginBottom: 8 }}>{errorHeaderMsg}</Alert> : null}
                            <input type="file" onChange={e => pickImage(e, "header")} className="filetype" accept="image/*" id="group_image" /><br />
                        </DialogContent>
                        <DialogActions style={{ backgroundColor: '#454545', color: 'white' }}>
                            {(headerLoading) ? <CircularProgress style={{ color: 'white' }} /> : <Button disabled={!newHeader} variant="outlined" onClick={() => {
                                setHeaderLoading(true)
                                updateHeader(user!.id, newHeader!).then(url => {
                                    setHeaderUrl(url)
                                    changingHeader(false)
                                }).catch(error => {
                                    setErrorHeaderMsg(error.message)
                                }).finally(() => setHeaderLoading(false))
                            }} color="primary" style={{ margin: 16, backgroundColor: 'red', color: "white" }}>
                                Update
                            </Button>}
                        </DialogActions>
                    </Dialog>
                    <Image src={(header_url) ? header_url : landscapeFieldImgURI} width={width * 0.5} height={300} onClick={e => {
                        if (isMyAccount()) { setHeaderAnchorEl(e.currentTarget) }
                    }} />
                    <div style={{ backgroundColor: defaultTheme, height: "100%", borderColor: "white", borderWidth: 1, borderStyle: "solid" }}>
                        {(editingProfile) ? <div style={{ display: "flex", padding: 16, flexDirection: "column" }}>
                            {editButton()}
                            <TextField label="Visibility" variant="outlined" className={styles.formTextField} onChange={e => setVisibility(e.target.value)} defaultValue={visibility} select>
                                <MenuItem key={"public"} value={"public"}>Public</MenuItem>
                                <MenuItem key={"private"} value={"private"}>Private</MenuItem>
                            </TextField>
                            <TextField label="Name" variant="outlined" className={styles.formTextField} onChange={e => setName(e.target.value)} value={name} />
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
                            <TextField label="Local area" variant="outlined" className={styles.formTextField} onChange={e => setLocalArea(e.target.value)} value={localArea} />
                            <TextField label="Bio" variant="outlined" className={styles.formTextField} onChange={e => setBio(e.target.value)} value={bio} fullWidth multiline minRows={4} />
                        </div> : <div style={{ display: "flex", paddingTop: 16, paddingLeft: 8, flexDirection: "column" }}>
                            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", width: "100%", height: 100 }}>
                                <IconButton
                                    aria-label="Thumbnail of the player"
                                    aria-haspopup="true"
                                    onClick={e => { if (isMyAccount()) setAnchorEl(e.currentTarget) }}
                                    color="inherit"
                                >
                                    {(thumbnail_url) ? <img src={thumbnail_url} width={100} height={100} style={{ borderRadius: 50 }} /> : <AccountCircle style={{ width: 100, height: 100, borderRadius: 50 }} />}
                                </IconButton>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                                        <Typography component={"div"} variant={"h5"} style={{ fontWeight: "bold", color: darkerTextColor, marginRight: 8 }}>
                                            {player.name}
                                        </Typography>
                                        {(player.is_private) ? <LockTwoTone style={{ width: 24, height: 24 }} /> : <div style={{ width: 24, height: 24 }} />}
                                    </div>
                                    <Typography style={{ color: darkerTextColor, marginTop: 16 }}>
                                        Position: {player.position}<br />
                                        Local area: {player.local_area}
                                    </Typography>
                                </div>
                                <div style={{ flexGrow: 1 }} />
                                {editButton()}
                            </div>
                            <Typography component={"div"} style={{ color: darkerTextColor, padding: 16 }}>
                                {player.bio}
                            </Typography>
                        </div>}
                    </div>
                    <Snackbar open={showSnackbar} autoHideDuration={6000} onClose={() => openSnackbar(false)}>
                        <Alert onClose={() => openSnackbar(false)} severity="error">{profileErrorMsg}</Alert>
                    </Snackbar>
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

    return <PageBase content={content()} region={"au"} onStateChanged={user => {
        setUser(user)
    }} />
}