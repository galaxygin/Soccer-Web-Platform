import { ImageList, ImageListItem, Link, Typography } from "@material-ui/core";
import { AccountCircle, LockTwoTone } from "@material-ui/icons";
import React, { useEffect, useState } from "react";
import { GameHeader, getPlayerLevel, getPlayerLevelJP, landscapeFieldImgURI } from "../Definitions";
import { defaultTheme, darkerTextColor } from "../public/assets/styles/styles.web";
import { removeSecondsFromTime } from "./DateManager";
import Image from "next/image"
import { isMobile } from "react-device-detect";

interface GameHeaderCellProps {
    games: GameHeader[]
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

export function GameCollectionNoWrap({ games, region }: GameHeaderCellProps) {
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
        {games.map(game => {
            if (game.passcode)
                return <ImageListItem style={{ width: size, height: 300, backgroundColor: defaultTheme, borderColor: "black", borderWidth: 1, borderStyle: "solid" }} key={game.id}>
                    <Link href={"/" + region + "/game?id=" + game.id}>
                        <Image src={landscapeFieldImgURI} width={size} height={150} />
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", flexWrap: "nowrap" }}>
                            <Typography variant="h6" style={{ color: darkerTextColor, fontWeight: "bold", flex: 1, overflow: "hidden", maxHeight: 30 }}>
                                {game.title}
                            </Typography>
                            <LockTwoTone style={{ color: "gray" }} />
                        </div>
                        <Typography component={"div"} style={{ color: darkerTextColor }}>
                            <Typography component={"div"} style={{ display: "flex", flexDirection: "row", alignItems: "center", height: 30 }}>
                                {(game.organizer.thumbnail_url) ? <img src={game.organizer.thumbnail_url} width={30} height={30} style={{ borderRadius: 15 }} /> : <AccountCircle style={{ width: 30, height: 30, borderRadius: 15 }} />}
                                {game.organizer.name}
                            </Typography>
                            <div style={{ height: 20, marginTop: 4, marginBottom: 4 }} />
                            {renderLevel(game.player_level, region)}<br />
                            {game.date}
                        </Typography>
                    </Link>
                </ImageListItem>
            else
                return <ImageListItem style={{ width: size, height: 300, backgroundColor: defaultTheme, borderColor: "black", borderWidth: 1, borderStyle: "solid" }} key={game.id}>
                    <Link href={"/" + region + "/game?id=" + game.id}>
                        <Image src={landscapeFieldImgURI} width={size} height={150} />
                        <Typography variant="h6" style={{ color: darkerTextColor, fontWeight: "bold", overflow: "hidden", maxHeight: 30 }}>
                            {game.title}
                        </Typography>
                        <Typography component={"div"} style={{ color: darkerTextColor }}>
                            <Typography component={"div"} style={{ display: "flex", flexDirection: "row", alignItems: "center", height: 30 }}>
                                {(game.organizer.thumbnail_url) ? <img src={game.organizer.thumbnail_url} width={30} height={30} style={{ borderRadius: 15 }} /> : <AccountCircle style={{ width: 30, height: 30, borderRadius: 15 }} />}
                                {game.organizer.name}
                            </Typography>
                            <Typography component={"div"} style={{ color: darkerTextColor, height: 20, marginTop: 4, marginBottom: 4 }}>
                                {game.location}
                            </Typography>
                            {renderLevel(game.player_level, region)}
                        </Typography>
                        <Typography component={"div"} style={{ display: "flex", flexDirection: "row", color: darkerTextColor }}>
                            {game.date + " " + removeSecondsFromTime(game.time)}<div style={{ flex: 1 }} />{renderParticipantsCount(game.participants, region)}
                        </Typography>
                    </Link>
                </ImageListItem>
        })}
    </ImageList>
}

export function GameCollection({ games, region }: GameHeaderCellProps) {
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
        {games.map(game => {
            if (game.passcode)
                return <ImageListItem style={{ width: size, height: 300, backgroundColor: defaultTheme, borderColor: "black", borderWidth: 1, borderStyle: "solid" }} key={game.id}>
                    <Link href={"/" + region + "/game?id=" + game.id}>
                        <Image src={landscapeFieldImgURI} width={size} height={150} />
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", flexWrap: "nowrap" }}>
                            <Typography variant="h6" style={{ color: darkerTextColor, fontWeight: "bold", flex: 1, overflow: "hidden", maxHeight: 30 }}>
                                {game.title}
                            </Typography>
                            <LockTwoTone style={{ color: "gray" }} />
                        </div>
                        <Typography component={"div"} style={{ color: darkerTextColor }}>
                            <Typography component={"div"} style={{ display: "flex", flexDirection: "row", alignItems: "center", height: 30 }}>
                                {(game.organizer.thumbnail_url) ? <img src={game.organizer.thumbnail_url} width={30} height={30} style={{ borderRadius: 15 }} /> : <AccountCircle style={{ width: 30, height: 30, borderRadius: 15 }} />}
                                {game.organizer.name}
                            </Typography>
                            <div style={{ height: 20, marginTop: 4, marginBottom: 4 }} />
                            {renderLevel(game.player_level, region)}<br />
                            {game.date}
                        </Typography>
                    </Link>
                </ImageListItem>
            else
                return <ImageListItem style={{ width: size, height: 300, backgroundColor: defaultTheme, borderColor: "black", borderWidth: 1, borderStyle: "solid" }} key={game.id}>
                    <Link href={"/" + region + "/game?id=" + game.id}>
                        <Image src={landscapeFieldImgURI} width={size} height={150} />
                        <Typography variant="h6" style={{ color: darkerTextColor, fontWeight: "bold", overflow: "hidden", maxHeight: 30 }}>
                            {game.title}
                        </Typography>
                        <Typography component={"div"} style={{ color: darkerTextColor }}>
                            <Typography component={"div"} style={{ display: "flex", flexDirection: "row", alignItems: "center", height: 30 }}>
                                {(game.organizer.thumbnail_url) ? <img src={game.organizer.thumbnail_url} width={30} height={30} style={{ borderRadius: 15 }} /> : <AccountCircle style={{ width: 30, height: 30, borderRadius: 15 }} />}
                                {game.organizer.name}
                            </Typography>
                            <Typography component={"div"} style={{ color: darkerTextColor, height: 20, marginTop: 4, marginBottom: 4 }}>
                                {game.location}
                            </Typography>
                            {renderLevel(game.player_level, region)}
                        </Typography>
                        <Typography component={"div"} style={{ display: "flex", flexDirection: "row", color: darkerTextColor }}>
                            {game.date + " " + removeSecondsFromTime(game.time)}<div style={{ flex: 1 }} />{renderParticipantsCount(game.participants, region)}
                        </Typography>
                    </Link>
                </ImageListItem>
        })}
    </ImageList>
}