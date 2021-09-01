import { ImageList, ImageListItem, Link, Typography } from "@material-ui/core";
import { AccountCircle, LockTwoTone } from "@material-ui/icons";
import React, { useEffect, useState } from "react";
import { getPlayerLevel, getPlayerLevelJP, landscapeFieldImgURI, TournamentHeader } from "../Definitions";
import { defaultTheme, darkerTextColor, useStyles } from "../public/assets/styles/styles.web";
import { removeSecondsFromTime } from "./DateManager";
import Image from "next/image"
import { isMobile } from "react-device-detect";

interface GameHeaderCellProps {
    tournaments: TournamentHeader[]
    region: string
}

function renderLevel(level: number, region: string) {
    switch (region) {
        case "au":
            return "Level: " + getPlayerLevel(level)
        case "jp":
            return "レベル: " + getPlayerLevelJP(level)
        default:
            return "Level: " + getPlayerLevel(level)
    }
}

function renderParticipantsCount(participants: number, region: string) {
    switch (region) {
        case "au":
            return participants + " players joining"
        case "jp":
            return "参加者: " + participants + "人"
        default:
            return participants + " players joining"
    }
}

export function TournamentCollectionNoWrap({ tournaments, region }: GameHeaderCellProps) {
    const styles = useStyles()
    const [size, setSize] = useState(0)

    useEffect(() => {
        function handleResize() {
            setSize((isMobile) ? window.innerWidth * 0.8 : window.innerWidth * 0.15)
        }
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, [])

    return <ImageList style={{ marginTop: 16, marginBottom: 16, width: "100%", flexWrap: "nowrap", transform: 'translateZ(0)' }} cols={3} gap={5}>
        {tournaments.map(tournament => {
            if (tournament.passcode)
                return <ImageListItem style={{ width: size, height: 300, backgroundColor: defaultTheme, borderColor: "black", borderWidth: 1, borderStyle: "solid" }} key={tournament.id}>
                    <Link href={"/" + region + "/tournament?id=" + tournament.id}>
                        <Image src={landscapeFieldImgURI} width={size} height={150} alt={tournament.title} />
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", flexWrap: "nowrap" }}>
                            <Typography variant="h6" style={{ color: darkerTextColor, fontWeight: "bold", flex: 1, overflow: "hidden", maxHeight: 30 }}>
                                {tournament.title}
                            </Typography>
                            <LockTwoTone style={{ color: "gray" }} />
                        </div>
                        <Typography component={"div"} style={{ color: darkerTextColor }}>
                            <Typography component={"div"} style={{ display: "flex", flexDirection: "row", alignItems: "center", height: 30 }}>
                                {(tournament.organizer.thumbnail_url) ? <Image src={tournament.organizer.thumbnail_url} width={30} height={30} className={styles.thumbnailCircle30} alt={tournament.organizer.name} /> : <AccountCircle style={{ width: 30, height: 30, borderRadius: 15 }} />}
                                {tournament.organizer.name}
                            </Typography>
                            <div style={{ height: 20, marginTop: 4, marginBottom: 4 }} />
                            {renderLevel(tournament.player_level, region)}<br />
                            {tournament.date}
                        </Typography>
                    </Link>
                </ImageListItem>
            else
                return <ImageListItem style={{ width: size, height: 300, backgroundColor: defaultTheme, borderColor: "black", borderWidth: 1, borderStyle: "solid" }} key={tournament.id}>
                    <Link href={"/" + region + "/tournament?id=" + tournament.id}>
                        <Image src={landscapeFieldImgURI} width={size} height={150} alt={tournament.title} />
                        <Typography variant="h6" style={{ color: darkerTextColor, fontWeight: "bold", overflow: "hidden", maxHeight: 30 }}>
                            {tournament.title}
                        </Typography>
                        <Typography component={"div"} style={{ color: darkerTextColor }}>
                            <Typography component={"div"} style={{ display: "flex", flexDirection: "row", alignItems: "center", height: 30 }}>
                                {(tournament.organizer.thumbnail_url) ? <Image src={tournament.organizer.thumbnail_url} width={30} height={30} className={styles.thumbnailCircle30} alt={tournament.organizer.name} /> : <AccountCircle style={{ width: 30, height: 30, borderRadius: 15 }} />}
                                {tournament.organizer.name}
                            </Typography>
                            <Typography component={"div"} style={{ color: darkerTextColor, height: 20, marginTop: 4, marginBottom: 4 }}>
                                {tournament.location}
                            </Typography>
                            {renderLevel(tournament.player_level, region)}
                        </Typography>
                        <Typography component={"div"} style={{ display: "flex", flexDirection: "row", color: darkerTextColor }}>
                            {tournament.date + " " + removeSecondsFromTime(tournament.time)}
                        </Typography>
                    </Link>
                </ImageListItem>
        })}
    </ImageList>
}

export function TournamentCollection({ tournaments, region }: GameHeaderCellProps) {
    const styles = useStyles()
    const [size, setSize] = useState(0)

    useEffect(() => {
        function handleResize() {
            setSize((isMobile) ? window.innerWidth * 0.8 : window.innerWidth * 0.15)
        }
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, [])

    return <ImageList style={{ marginTop: 16, marginBottom: 16, width: "100%", justifyContent: "space-around" }} cols={3} gap={5}>
        {tournaments.map(tournament => {
            if (tournament.passcode)
                return <ImageListItem style={{ width: size, height: 300, backgroundColor: defaultTheme, borderColor: "black", borderWidth: 1, borderStyle: "solid" }} key={tournament.id}>
                    <Link href={"/" + region + "/tournament?id=" + tournament.id}>
                        <Image src={landscapeFieldImgURI} width={size} height={150} alt={tournament.title} />
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", flexWrap: "nowrap" }}>
                            <Typography variant="h6" style={{ color: darkerTextColor, fontWeight: "bold", flex: 1, overflow: "hidden", maxHeight: 30 }}>
                                {tournament.title}
                            </Typography>
                            <LockTwoTone style={{ color: "gray" }} />
                        </div>
                        <Typography component={"div"} style={{ color: darkerTextColor }}>
                            <Typography component={"div"} style={{ display: "flex", flexDirection: "row", alignItems: "center", height: 30 }}>
                                {(tournament.organizer.thumbnail_url) ? <Image src={tournament.organizer.thumbnail_url} width={30} height={30} className={styles.thumbnailCircle30} alt={tournament.organizer.name} /> : <AccountCircle style={{ width: 30, height: 30, borderRadius: 15 }} />}
                                {tournament.organizer.name}
                            </Typography>
                            <div style={{ height: 20, marginTop: 4, marginBottom: 4 }} />
                            {renderLevel(tournament.player_level, region)}<br />
                            {tournament.date}
                        </Typography>
                    </Link>
                </ImageListItem>
            else
                return <ImageListItem style={{ width: size, height: 300, backgroundColor: defaultTheme, borderColor: "black", borderWidth: 1, borderStyle: "solid" }} key={tournament.id}>
                    <Link href={"/" + region + "/tournament?id=" + tournament.id}>
                        <Image src={landscapeFieldImgURI} width={size} height={150} alt={tournament.title} />
                        <Typography variant="h6" style={{ color: darkerTextColor, fontWeight: "bold", overflow: "hidden", maxHeight: 30 }}>
                            {tournament.title}
                        </Typography>
                        <Typography component={"div"} style={{ color: darkerTextColor }}>
                            <Typography component={"div"} style={{ display: "flex", flexDirection: "row", alignItems: "center", height: 30 }}>
                                {(tournament.organizer.thumbnail_url) ? <Image src={tournament.organizer.thumbnail_url} width={30} height={30} className={styles.thumbnailCircle30} alt={tournament.organizer.name} /> : <AccountCircle style={{ width: 30, height: 30, borderRadius: 15 }} />}
                                {tournament.organizer.name}
                            </Typography>
                            <Typography component={"div"} style={{ color: darkerTextColor, height: 20, marginTop: 4, marginBottom: 4 }}>
                                {tournament.location}
                            </Typography>
                            {renderLevel(tournament.player_level, region)}
                        </Typography>
                        <Typography component={"div"} style={{ display: "flex", flexDirection: "row", color: darkerTextColor }}>
                            {tournament.date + " " + removeSecondsFromTime(tournament.time)}
                        </Typography>
                    </Link>
                </ImageListItem>
        })}
    </ImageList>
}