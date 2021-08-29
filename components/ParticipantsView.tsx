import { Button, CircularProgress, IconButton, List, ListItem, Typography } from "@material-ui/core";
import React, { useState, useEffect, useCallback } from "react";
import { landscapeFieldImgURI, SimpleProfile } from "../Definitions";
import Image from 'next/image'
import { backgroundTheme, darkerTextColor, useStyles } from "../public/assets/styles/styles.web";
import { useRouter } from "next/router";
import { AccountCircle, LockTwoTone, RefreshTwoTone } from "@material-ui/icons";
import { getParticipants } from "../api/request/GameTestRequest";
import { RealtimeSubscription } from "@supabase/supabase-js";
import { supabase } from "../SupabaseManager";
import { getSimpleProfile } from "../api/request/UserRequest";
import { isMobile } from "react-device-detect";

interface props {
    game_id: string
    region: string
    uid?: string
}

export default function ParticipantsView({ game_id, region, uid }: props) {
    const styles = useStyles()
    const router = useRouter()
    const [participants, setParticipants] = useState<SimpleProfile[]>([])
    const [loading, setLoading] = useState(false)
    const [width, setWidth] = useState(0)

    const updateList = useCallback(() => {
        if (!game_id)
            return
        setLoading(true)
        getParticipants(game_id).then(participants => setParticipants(participants)).catch(error => console.log(error.message)).finally(() => setLoading(false))
    }, [game_id])

    useEffect(() => {
        if (!game_id)
            return
        setWidth(window.innerWidth)
        updateList()
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
    }, [game_id, updateList])

    function renderParticipants() {
        switch (region) {
            case "jp":
                return <Typography variant="h5" style={{ color: darkerTextColor, marginLeft: 16 }}>参加者</Typography>
            default:
                return <Typography variant="h5" style={{ color: darkerTextColor, marginLeft: 16 }}>Participants</Typography>
        }
    }

    function renderPosition(position?: string) {
        switch (region) {
            case "jp":
                return "ポジション: " + position
            default:
                return "Position: " + position
        }
    }

    function renderErrorContent() {
        switch (region) {
            case "jp":
                return (
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", paddingTop: 20 }}>
                        <Typography style={{ color: darkerTextColor }}>
                            参加者の取得に失敗しました。
                        </Typography>
                        <Button style={{ backgroundColor: "red", color: "white" }} onClick={() => updateList()}>リトライ</Button>
                    </div >
                )
            default:
                return (
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", paddingTop: 20 }}>
                        <Typography style={{ color: darkerTextColor }}>
                            Something went wrong and couldn&apos;t get participants
                        </Typography>
                        <Button style={{ backgroundColor: "red", color: "white" }} onClick={() => updateList()}>Retry</Button>
                    </div >
                )
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
        if (participants.length > 0) {
            return (
                <List>
                    {participants.map(player => (
                        <ListItem key={player.uid} onClick={() => router.push({ pathname: "/au/player", query: { uid: player.uid } })}>
                            <Typography component={"div"} style={{ display: "flex", flexDirection: "row" }}>
                                {(player.thumbnail_url) ? <Image src={player.thumbnail_url} width={48} height={48} className={styles.thumbnailCircle48} alt={"player thumbnail"} /> : <AccountCircle style={{ width: 48, height: 48, borderRadius: 24 }} />}
                                <div style={{ display: "flex", flexDirection: "column", color: darkerTextColor, marginLeft: 16 }}>
                                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", width: "100%", maxHeight: 20 }}>
                                        <Typography component={"div"} style={{ fontWeight: "bold", marginRight: 8, flex: 1 }}>
                                            {player.name}
                                        </Typography>
                                        {(player.is_private) ? <LockTwoTone /> : null}
                                    </div>
                                    {renderPosition(player.position)}
                                </div>
                            </Typography>
                        </ListItem>
                    ))}
                </List>
            )
        } else {
            renderErrorContent()
        }
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", backgroundColor: "white", borderColor: backgroundTheme, borderWidth: 1, borderStyle: "solid" }}>
            <Image src={landscapeFieldImgURI} width={(isMobile) ? width : width * 0.5} height={300} alt={"field header"} />
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                {renderParticipants()}
                <IconButton onClick={() => updateList()}>
                    <RefreshTwoTone style={{ color: backgroundTheme }} />
                </IconButton>
            </div>
            {content()}
        </div >
    )
}