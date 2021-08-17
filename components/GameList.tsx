import { ImageList, ImageListItem, Link, Typography } from "@material-ui/core";
import { AccountCircle, LockTwoTone } from "@material-ui/icons";
import React from "react";
import { GameHeader, getPlayerLevel, landscapeFieldImgURI } from "../Definitions";
import { defaultTheme, darkerTextColor } from "../public/assets/styles/styles.web";
import { removeSecondsFromTime } from "./DateManager";
import Image from "next/image"

interface GameHeaderCellProps {
    games: GameHeader[]
    size: number
}

export function GameList({ games, size }: GameHeaderCellProps) {
    return <ImageList style={{ marginTop: 16, marginBottom: 16, width: "100%", flexWrap: "nowrap" }} gap={5}>
        {games.map(game => {
            if (game.passcode)
                return <ImageListItem style={{ width: size, height: 300, backgroundColor: defaultTheme, borderColor: "black", borderWidth: 1, borderStyle: "solid" }} key={game.id}>
                    <Link href={"/game?id=" + game.id}>
                        <Image src={landscapeFieldImgURI} width={size} height={150} />
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", flexWrap: "nowrap" }}>
                            <Typography variant="h6" style={{ color: darkerTextColor, fontWeight: "bold", flex: 1, overflow: "hidden" }}>
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
                            Level: {getPlayerLevel(game.player_level)}<br />
                            {game.date}
                        </Typography>
                    </Link>
                </ImageListItem>
            else
                return <ImageListItem style={{ width: size, height: 300, backgroundColor: defaultTheme, borderColor: "black", borderWidth: 1, borderStyle: "solid" }} key={game.id}>
                    <Link href={"/game?id=" + game.id}>
                        <Image src={landscapeFieldImgURI} width={size} height={150} />
                        <Typography variant="h6" style={{ color: darkerTextColor, fontWeight: "bold", overflow: "hidden" }}>
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
                            Level: {getPlayerLevel(game.player_level)}
                        </Typography>
                        <Typography component={"div"} style={{ display: "flex", flexDirection: "row", color: darkerTextColor }}>
                            {game.date + " " + removeSecondsFromTime(game.time)}<div style={{ flex: 1 }} />{game.participants + " players joining"}
                        </Typography>
                    </Link>
                </ImageListItem>
        })}
    </ImageList>
}