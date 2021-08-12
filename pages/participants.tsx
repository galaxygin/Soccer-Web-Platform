import { AppBar, Button, CircularProgress, IconButton, List, ListItem, Toolbar, Typography } from "@material-ui/core";
import React, { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { Player } from "../Definitions";
import PageBase from "./PageBase";
import Image from 'next/image'
import { backgroundTheme, darkerTextColor, useStyles } from "../public/assets/styles/styles.web";
import { useRouter } from "next/router";
import { AccountCircle, RefreshTwoTone } from "@material-ui/icons";
import { Alert } from "@material-ui/lab";
import { getParticipants } from "../api/request/GameRequest";
import { isMobile } from "react-device-detect";

interface props {
    game_id: string
}

export default function Participants({ game_id }: props) {
    const styles = useStyles()
    const router = useRouter()
    const [participants, setParticipants] = useState<Player[]>([])
    const [cookies, setCookie, removeCookie] = useCookies(['uid'])
    const [loading, setLoading] = useState(true)
    const [width, setWidth] = useState(0)

    useEffect(() => {
        setWidth(window.innerWidth)
        updateList()
    }, [])

    function updateList() {
        if (game_id) {
            getParticipants(game_id).then(participants => setParticipants(participants)).catch(error => console.log(error.message)).finally(() => setLoading(false))
            return
        }
        if (router.query.id) {
            getParticipants(router.query.id as string).then(participants => setParticipants(participants)).catch(error => console.log(error.message)).finally(() => setLoading(false))
            return
        }
        setLoading(false)
    }

    function isMyAccount(): boolean {
        return router.query.uid == cookies.uid
    }

    function content() {
        if (loading) {
            return (
                <div style={{ display: "flex", flexDirection: 'column', justifyContent: "center", alignItems: "center", width: "100%", height: "100%" }}>
                    <CircularProgress style={{ color: darkerTextColor }} />
                </div >
            )
        }
        if (participants.length > 0) {
            return (
                <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "white", borderColor: backgroundTheme, borderWidth: 1, borderStyle: "solid" }}>
                    <AppBar>
                        <Toolbar>

                        </Toolbar>
                    </AppBar>
                    <Image src={"/assets/images/SoccerFieldLandscape.jpg"} width={width * 0.5} height={350} />
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                        <Typography variant="h5" style={{ color: darkerTextColor, marginLeft: 16 }}>Participants</Typography>
                        <IconButton onClick={() => updateList()}>
                            <RefreshTwoTone style={{ color: backgroundTheme }} />
                        </IconButton>
                    </div>
                    <List>
                        {participants.map(player => (
                            <ListItem key={player.uid}>
                                <Typography style={{ display: "flex", flexDirection: "row" }}>
                                    {(player.thumbnailUrl) ? <img src={player.thumbnailUrl} width={48} height={48} style={{ borderRadius: 24 }} /> : <AccountCircle style={{ width: 48, height: 48, borderRadius: 24 }} />}
                                    <div style={{ display: "flex", flexDirection: "column", color: darkerTextColor, marginLeft: 16 }}>
                                        <Typography style={{ fontWeight: "bold" }}>
                                            {player.name}
                                        </Typography>
                                        Position: {player.position}
                                    </div>
                                </Typography>
                            </ListItem>
                        ))}
                    </List>
                </div >
            )
        } else {
            return (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", paddingTop: 20 }}>
                    <Typography style={{ color: darkerTextColor }}>
                        Something went wrong and couldn't get participants
                    </Typography>
                    <Button style={{ backgroundColor: "red", color: "white" }} onClick={() => updateList()}>Retry</Button>
                </div >
            )
        }
    }

    if (isMobile)
        return <PageBase content={content()} />
    else
        return content()
}