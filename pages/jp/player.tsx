import { Button, CircularProgress, Dialog, DialogActions, IconButton, Menu, MenuItem, Snackbar, TextField, Typography } from "@material-ui/core";
import React, { useState, useEffect } from "react";
import { getPlayerMetaData, getProfile, updateProfile } from "../../api/request/UserRequest";
import { baseUrl, landscapeFieldImgURI, Player, PlayerMetaData } from "../../Definitions";
import PageBase from "../PageBase";
import Image from 'next/image'
import { darkerTextColor, defaultTheme, useStyles } from "../../public/assets/styles/styles.web";
import { useRouter } from "next/router";
import { AccountCircle, Close, Done, Edit, LockTwoTone } from "@material-ui/icons";
import { Alert } from "@material-ui/lab";
import { User } from "@supabase/supabase-js";
import Header from "../Header";
import { HeaderUploader, ThumbnailUploader } from "../../components/ImageUploader";
import { isMobile } from "react-device-detect";

interface props {
    metadata: PlayerMetaData | null
    url: string
    site_name: string
}

export default function PlayerView({ metadata, url, site_name }: props) {
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
    const [localArea, setLocalArea] = useState<string | undefined>("")
    const [thumbnail_url, setThumbnailUrl] = useState<string>()
    const [header_url, setHeaderUrl] = useState<string>()
    const [visibility, setVisibility] = useState("public")
    const [profileErrorMsg, setProfileErrorMsg] = useState(null)

    const [changeThumb, changingThumb] = useState(false)
    const [changeHeader, changingHeader] = useState(false)

    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const isMenuOpen = Boolean(anchorEl);

    const [headerAnchorEl, setHeaderAnchorEl] = useState<HTMLElement | null>(null);
    const isHeaderMenuOpen = Boolean(headerAnchorEl);

    useEffect(() => {
        setWidth(window.innerWidth)
        setHeight(window.innerHeight)
    }, [])

    useEffect(() => {
        if (metadata) {
            updateInfo()
            return
        }
        setLoading(false)
    }, [metadata])

    function updateInfo() {
        getProfile(metadata!.uid).then(player => {
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

    function isMyAccount(): boolean {
        return metadata?.uid == user?.id
    }

    function editButton() {
        if (isMyAccount()) {
            if (editingProfile)
                return <div style={{ display: 'flex', flexDirection: "row" }}>
                    <IconButton onClick={() => changingProfile(false)} style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: "red", color: "white" }}><Close /></IconButton>
                    <div style={{ flexGrow: 1 }} />
                    <IconButton onClick={() => updateProfile(user!.id, name, bio, position, visibility, localArea).then(() => { updateInfo(); changingProfile(false) }).catch(error => { setProfileErrorMsg(error.message); openSnackbar(true) })} style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: "green", color: "white" }}><Done /></IconButton>
                </div>
            else
                return <IconButton onClick={() => changingProfile(true)} style={{ width: 50, height: 50, borderRadius: 25, marginRight: 16, backgroundColor: "green", color: "white", alignSelf: "start" }}><Edit /></IconButton>
        }
    }

    function content() {
        if (player) {
            if (user)
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
                            }}>サムネ画像を変更</MenuItem>
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
                            }}>ヘッダー画像を変更</MenuItem>
                        </Menu>
                        <Dialog open={changeThumb} onClose={() => changingThumb(false)} fullWidth>
                            <ThumbnailUploader uid={user!.id} region={"jp"} onSuccess={url => setThumbnailUrl(url)} />
                            <DialogActions style={{ backgroundColor: 'white', marginTop: 32 }}>
                                <Button variant="outlined" onClick={() => changingThumb(false)}>閉じる</Button>
                                <div style={{ flexGrow: 1 }} />
                                <Button variant="outlined" onClick={() => changingThumb(false)}>完了</Button>
                            </DialogActions>
                        </Dialog>
                        <Dialog open={changeHeader} onClose={() => changingHeader(false)} fullWidth>
                            <HeaderUploader uid={user!.id} region={"jp"} onSuccess={url => setHeaderUrl(url)} imagePreviewWidth={width * 0.5} />
                            <DialogActions style={{ backgroundColor: 'white', marginTop: 32 }}>
                                <Button variant="outlined" onClick={() => changingHeader(false)}>閉じる</Button>
                                <div style={{ flexGrow: 1 }} />
                                <Button variant="outlined" onClick={() => changingHeader(false)}>完了</Button>
                            </DialogActions>
                        </Dialog>
                        <Image src={(header_url) ? header_url : landscapeFieldImgURI} width={(isMobile) ? width : width * 0.5} height={300} onClick={e => {
                            if (isMyAccount()) { setHeaderAnchorEl(e.currentTarget) }
                        }} />
                        <div style={{ backgroundColor: defaultTheme, height: "100%", borderColor: "white", borderWidth: 1, borderStyle: "solid" }}>
                            {(editingProfile) ? <div style={{ display: "flex", padding: 16, flexDirection: "column" }}>
                                {editButton()}
                                <TextField label="プロフィール" variant="outlined" className={styles.formTextField} onChange={e => setVisibility(e.target.value)} defaultValue={visibility} select>
                                    <MenuItem key={"public"} value={"public"}>公開</MenuItem>
                                    <MenuItem key={"private"} value={"private"}>非公開</MenuItem>
                                </TextField>
                                <TextField label="Name" variant="outlined" className={styles.formTextField} onChange={e => setName(e.target.value)} value={name} />
                                <TextField label="Position" variant="outlined" className={styles.formTextField} onChange={e => setPosition(e.target.value)} defaultValue={position} select>
                                    <MenuItem key={""} value={""}>どこでも</MenuItem>
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
                                            ポジション: {player.position}<br />
                                            地元: {player.local_area}
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
            else
                return (
                    <div style={{ display: "flex", flexDirection: "column", height: height - 115 }}>
                        <Image src={(header_url) ? header_url : landscapeFieldImgURI} width={(isMobile) ? width : width * 0.5} height={300} />
                        <div style={{ backgroundColor: defaultTheme, height: "100%", borderColor: "white", borderWidth: 1, borderStyle: "solid" }}>
                            <div style={{ display: "flex", paddingTop: 16, paddingLeft: 8, flexDirection: "column" }}>
                                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", width: "100%", height: 100 }}>
                                    <IconButton
                                        aria-label="Thumbnail of the player"
                                        aria-haspopup="true"
                                        color="inherit"
                                        disabled
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
                                            ポジション: {player.position}<br />
                                            地元: {player.local_area}
                                        </Typography>
                                    </div>
                                </div>
                                <Typography component={"div"} style={{ color: darkerTextColor, padding: 16 }}>
                                    {player.bio}
                                </Typography>
                            </div>
                        </div>
                    </div >
                )
        } else {
            if (loading)
                return (
                    <div style={{ display: "flex", flexDirection: 'column', justifyContent: "center", alignItems: "center", width: "100%", height: "100%" }}>
                        <CircularProgress style={{ color: darkerTextColor }} />
                    </div >
                )
            else
                return (
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", paddingTop: 20 }}>
                        <Typography style={{ color: darkerTextColor }}>
                            プレイヤーのプロファイルの取得に失敗しました。
                        </Typography>
                    </div >
                )
        }
    }

    return <PageBase content={content()} header={<Header title={(metadata) ? metadata.name : "プレイヤー名の取得に失敗しました"} description={(metadata?.is_private) ? "非公開か、説明の取得に失敗しました" : metadata?.bio} thumbnail_url={metadata?.thumbnail_url} url={baseUrl + url} site_name={site_name} />} region={"jp"} onStateChanged={user => {
        setUser(user)
    }} />
}

export async function getServerSideProps(context: any) {
    const { uid } = context.query
    if (uid) {
        var data = null
        await getPlayerMetaData(uid).then(metadata => {
            data = metadata
        }).catch(error => console.log(error.message))
        return { props: { metadata: data, url: context["resolvedUrl"], site_name: context["req"].headers.host } }
    } else {
        return { props: { metadata: null, url: context["resolvedUrl"], site_name: context["req"].headers.host } }
    }
}