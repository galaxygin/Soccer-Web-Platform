import { withStyles } from "@material-ui/styles";
import { withRouter } from "next/router";
import { getProfile, getSimpleProfile, updateProfile } from "../../api/request/UserRequest";
import { landscapeFieldImgURI, Player, SimpleProfile } from "../../Definitions";
import PageBase, { BaseProps, BaseStates, styles } from "./PageBase";
import Header from "../Header"
import React from "react";
import { CircularProgress, Dialog, IconButton, Menu, MenuItem, TextField, Typography } from "@material-ui/core";
import { Close, Edit, Done, AccountCircle, LockTwoTone } from "@material-ui/icons";
import { darkerTextColor, defaultTheme } from "../../public/assets/styles/styles.web";
import Image from "next/image";

interface Props extends BaseProps {
    metadata: SimpleProfile
}

interface States extends BaseStates {
    loading: boolean
    player: Player | null
    editingProfile: boolean
    name: string
    bio: string
    position: string
    localArea?: string
    thumbnail_url?: string
    header_url?: string
    visibility: string
    changeThumb: boolean
    changeHeader: boolean
    thumbAnchorEl?: HTMLElement | null
    headerAnchorEl?: HTMLElement | null
}

class PlayerView extends PageBase<Props, States> {
    state: States = {
        region: "au",
        selectedNavValue: "/",
        loading: true,
        player: null,
        editingProfile: false,
        name: this.props.metadata.name,
        bio: this.props.metadata.name,
        position: "",
        thumbnail_url: this.props.metadata.thumbnail_url,
        visibility: "public",
        changeThumb: false,
        changeHeader: false
    }

    onBaseLoaded() {
        if (this.props.metadata.uid) {
            this.updateInfo()
            return
        }
        this.setState({ loading: false })
    }

    updateInfo() {
        getProfile(this.props.metadata.uid as string).then(player => {
            if (player) {
                this.setState({ player: player, position: player.position, localArea: player.local_area!, header_url: player.header_url, visibility: (player.is_private) ? "private" : "public" })
            }
        }).catch(error => this.showSnackErrorMsg(error.message)).finally(() => this.setState({ loading: false }))
    }

    isMyAccount(): boolean {
        return this.props.metadata.uid === this.state.user!.id
    }

    editButton() {
        if (this.isMyAccount()) {
            if (this.state.editingProfile)
                return <div style={{ display: 'flex', flexDirection: "row" }}>
                    <IconButton onClick={() => this.setState({ editingProfile: false })} style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: "red", color: "white" }}><Close /></IconButton>
                    <div style={{ flexGrow: 1 }} />
                    <IconButton onClick={() => updateProfile(this.state.user!.id, this.state.name, this.state.bio, this.state.position, this.state.localArea!, this.state.visibility).then(() => { this.updateInfo(); this.setState({ editingProfile: false }) }).catch(error => this.showSnackErrorMsg(error.message))} style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: "green", color: "white" }}><Done /></IconButton>
                </div>
            else
                return <IconButton onClick={() => this.setState({ editingProfile: false })} style={{ width: 50, height: 50, borderRadius: 25, marginRight: 16, backgroundColor: "green", color: "white", alignSelf: "start" }}><Edit /></IconButton>
        }
    }

    renderHeader() {
        return <Header title={(this.props.metadata?.name) ? this.props.metadata.name : "Private or couldn't get title"} description={(this.props.metadata && this.props.metadata.is_private) ? "Private or couldn't get description" : this.props.metadata.name} thumbnail_url={(this.props.metadata.thumbnail_url) ? this.props.metadata.thumbnail_url : ""} />
    }

    renderContent() {
        if (this.state.loading) {
            return (
                <div style={{ display: "flex", flexDirection: 'column', justifyContent: "center", alignItems: "center", width: "100%", height: "100%" }}>
                    <CircularProgress style={{ color: darkerTextColor }} />
                </div >
            )
        }
        if (this.state.player) {
            return (
                <div style={{ display: "flex", flexDirection: "column", height: this.state.height! - 115 }}>
                    <Menu
                        anchorEl={this.state.thumbAnchorEl}
                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                        id={"thumbnail_menu"}
                        keepMounted
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                        open={(this.state.thumbAnchorEl) ? true : false}
                        onClose={e => this.setState({ thumbAnchorEl: null })}
                    >
                        <MenuItem onClick={() => this.setState({ thumbAnchorEl: null, changeThumb: true })}>Update thumbnail</MenuItem>
                    </Menu>
                    <Menu
                        anchorEl={this.state.headerAnchorEl}
                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                        id={"header_menu"}
                        keepMounted
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                        open={(this.state.headerAnchorEl) ? true : false}
                        onClose={e => this.setState({ headerAnchorEl: null })}
                    >
                        <MenuItem onClick={() => this.setState({ headerAnchorEl: null, changeHeader: true })}>Update header</MenuItem>
                    </Menu>
                    <Dialog open={this.state.changeThumb} onClose={() => this.setState({ newThumb: undefined, changeThumb: false })} fullWidth>
                    </Dialog>
                    <Dialog open={this.state.changeHeader} onClose={() => this.setState({ newHeader: undefined, changeHeader: false })} fullWidth>
                    </Dialog>
                    <Image src={(this.state.header_url) ? this.state.header_url : landscapeFieldImgURI} width={this.state.width! * 0.5} height={300} onClick={e => {
                        if (this.isMyAccount()) { this.setState({ headerAnchorEl: e.currentTarget }) }
                    }} />
                    <div style={{ backgroundColor: defaultTheme, height: "100%", borderColor: "white", borderWidth: 1, borderStyle: "solid" }}>
                        {(this.state.editingProfile) ? <div style={{ display: "flex", padding: 16, flexDirection: "column" }}>
                            {this.editButton()}
                            <TextField label="Visibility" variant="outlined" className={this.styles.formTextField} onChange={e => this.setState({ visibility: e.target.value })} defaultValue={this.state.visibility} select>
                                <MenuItem key={"public"} value={"public"}>Public</MenuItem>
                                <MenuItem key={"private"} value={"private"}>Private</MenuItem>
                            </TextField>
                            <TextField label="Name" variant="outlined" className={this.styles.formTextField} onChange={e => this.setState({ name: e.target.value })} value={this.state.name} />
                            <TextField label="Position" variant="outlined" className={this.styles.formTextField} onChange={e => this.setState({ position: e.target.value })} defaultValue={this.state.position} select>
                                <MenuItem key={""} value={""}>Anywhere</MenuItem>
                                <MenuItem key={"GK"} value={"GK"}>GK</MenuItem>
                                <MenuItem key={"CB"} value={"CB"}>CB</MenuItem>
                                <MenuItem key={"SB"} value={"SB"}>SB</MenuItem>
                                <MenuItem key={"MF"} value={"MF"}>MF</MenuItem>
                                <MenuItem key={"CF"} value={"CF"}>CF</MenuItem>
                                <MenuItem key={"LW"} value={"LW"}>LW</MenuItem>
                                <MenuItem key={"RW"} value={"RW"}>RW</MenuItem>
                            </TextField>
                            <TextField label="Local area" variant="outlined" className={this.styles.formTextField} onChange={e => this.setState({ localArea: e.target.value })} value={this.state.localArea} />
                            <TextField label="Bio" variant="outlined" className={this.styles.formTextField} onChange={e => this.setState({ bio: e.target.value })} value={this.state.bio} fullWidth multiline minRows={4} />
                        </div> : <div style={{ display: "flex", paddingTop: 16, paddingLeft: 8, flexDirection: "column" }}>
                            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", width: "100%", height: 100 }}>
                                <IconButton
                                    aria-label="Thumbnail of the player"
                                    aria-haspopup="true"
                                    onClick={e => { if (this.isMyAccount()) this.setState({ thumbAnchorEl: e.currentTarget }) }}
                                    color="inherit"
                                >
                                    {(this.state.thumbnail_url) ? <img src={this.state.thumbnail_url} width={100} height={100} style={{ borderRadius: 50 }} /> : <AccountCircle style={{ width: 100, height: 100, borderRadius: 50 }} />}
                                </IconButton>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                                        <Typography component={"div"} variant={"h5"} style={{ fontWeight: "bold", color: darkerTextColor, marginRight: 8 }}>
                                            {this.state.player.name}
                                        </Typography>
                                        {(this.state.player.is_private) ? <LockTwoTone style={{ width: 24, height: 24 }} /> : <div style={{ width: 24, height: 24 }} />}
                                    </div>
                                    <Typography style={{ color: darkerTextColor, marginTop: 16 }}>
                                        Position: {this.state.player.position}<br />
                                        Local area: {this.state.player.local_area}
                                    </Typography>
                                </div>
                                <div style={{ flexGrow: 1 }} />
                                {this.editButton()}
                            </div>
                            <Typography component={"div"} style={{ color: darkerTextColor, padding: 16 }}>
                                {this.state.player.bio}
                            </Typography>
                        </div>}
                    </div>
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
}

export async function getServerSideProps(context: any) {
    const { uid } = context.query
    if (uid) {
        var data = null
        await getSimpleProfile(uid).then(metadata => {
            data = metadata
        }).catch(error => console.log(error.message))
        return { props: { metadata: data } }
    } else {
        return { props: { metadata: null } }
    }
}

export default withStyles(styles, { withTheme: true })(withRouter(PlayerView));