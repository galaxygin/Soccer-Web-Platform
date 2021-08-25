import { Button, CircularProgress, IconButton, List, ListItem, Typography } from "@material-ui/core";
import React, { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { landscapeFieldImgURI, SimpleProfile } from "../../Definitions";
import Image from 'next/image'
import { backgroundTheme, darkerTextColor, useStyles } from "../../public/assets/styles/styles.web";
import { useRouter } from "next/router";
import { AccountCircle, LockTwoTone, RefreshTwoTone } from "@material-ui/icons";
import { getParticipants } from "../../api/request/GameTestRequest";
import { RealtimeSubscription } from "@supabase/supabase-js";
import { supabase } from "../../SupabaseManager";
import { getSimpleProfile } from "../../api/request/UserRequest";

interface props {
    game_id: string
}

export default function ParticipantsView({ game_id }: props) {
    const styles = useStyles()
    const router = useRouter()
    const [participants, setParticipants] = useState<SimpleProfile[]>([])
    const [cookies, setCookie, removeCookie] = useCookies(['uid'])
    const [loading, setLoading] = useState(true)
    const [width, setWidth] = useState(0)

    useEffect(() => {
        setWidth(window.innerWidth)
        updateList()
    }, [])

    useEffect(() => {
        var subscription: RealtimeSubscription
        subscription = supabase.from('test_participants:game_id=eq.' + game_id)
            .on('INSERT', payload => {
                getSimpleProfile(payload.new.uid).then(user => setParticipants(prevState => [...prevState, { uid: user.uid, name: user.name, thumbnail_url: user.thumbnail_url, position: user.position, is_private: user.is_private }]))
            }).on('DELETE', payload => {
                setParticipants(prevState => prevState.filter(participant => participant.uid !== payload.old.uid))
            }).subscribe()
        return () => {
            if (subscription)
                subscription.unsubscribe()
        }
    }, [])

    function updateList() {
        if (game_id) {
            getParticipants(game_id).then(participants => setParticipants(participants)).catch(error => console.log(error.message)).finally(() => setLoading(false))
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
                <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", backgroundColor: "white", borderColor: backgroundTheme, borderWidth: 1, borderStyle: "solid" }}>
                    <Image src={landscapeFieldImgURI} width={width * 0.5} height={300} />
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                        <Typography variant="h5" style={{ color: darkerTextColor, marginLeft: 16 }}>参加者</Typography>
                        <IconButton onClick={() => updateList()}>
                            <RefreshTwoTone style={{ color: backgroundTheme }} />
                        </IconButton>
                    </div>
                    <List>
                        {participants.map(player => (
                            <ListItem key={player.uid} onClick={() => router.push({ pathname: "/jp/player", query: { uid: player.uid } })}>
                                <Typography component={"div"} style={{ display: "flex", flexDirection: "row" }}>
                                    {(player.thumbnail_url) ? <img src={player.thumbnail_url} width={48} height={48} style={{ borderRadius: 24 }} /> : <AccountCircle style={{ width: 48, height: 48, borderRadius: 24 }} />}
                                    <div style={{ display: "flex", flexDirection: "column", color: darkerTextColor, marginLeft: 16 }}>
                                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", width: "100%", maxHeight: 20 }}>
                                            <Typography component={"div"} style={{ fontWeight: "bold", marginRight: 8, flex: 1 }}>
                                                {player.name}
                                            </Typography>
                                            {(player.is_private) ? <LockTwoTone /> : null}
                                        </div>
                                        ポジション: {player.position}
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
                        参加者の取得に失敗しました。
                    </Typography>
                    <Button style={{ backgroundColor: "red", color: "white" }} onClick={() => updateList()}>Retry</Button>
                </div >
            )
        }
    }

    return content()
}