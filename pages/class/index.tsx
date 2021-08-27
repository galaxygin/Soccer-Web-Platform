import { Typography, CircularProgress, Fab } from "@material-ui/core";
import { AddTwoTone } from "@material-ui/icons";
import { withStyles } from "@material-ui/styles";
import { withRouter } from "next/router";
import React from "react";
import { isMobile } from "react-device-detect";
import { getGamesOfTheWeek, getMyGames } from "../../api/request/GameTestRequest";
import { GameCollectionNoWrap } from "../../components/GameList";
import OrganizeForm from "../../components/OrganizeForm";
import { GameHeader } from "../../Definitions";
import { darkerTextColor, backgroundTheme } from "../../public/assets/styles/styles.web";
import PageBase, { BaseProps, BaseStates, styles } from "./PageBase";

interface States extends BaseStates {
    loadingMyGames: boolean
    myGames: GameHeader[]
    loadingGamesOfTheWeek: boolean
    gamesOfTheWeek: GameHeader[]
    showPostDialog: boolean
}

class HomeView extends PageBase<BaseProps, States> {
    state: States = {
        region: "au",
        selectedNavValue: "/",
        loadingMyGames: true,
        myGames: [],
        loadingGamesOfTheWeek: true,
        gamesOfTheWeek: [],
        showPostDialog: false
    }

    onBaseLoaded() {
        if (this.state.user) {
            this.fetchMyGames()
        }
        this.fetchWeekGames()
    }

    fetchMyGames() {
        this.setState({ loadingMyGames: true })
        getMyGames(this.state.user!.id).then(games => this.setState({ myGames: games })).catch(error => console.log(error.message)).finally(() => this.setState({ loadingMyGames: false }))
    }

    fetchWeekGames() {
        this.setState({ loadingGamesOfTheWeek: true })
        getGamesOfTheWeek().then(games => this.setState({ gamesOfTheWeek: games })).catch(error => console.log(error.message)).finally(() => this.setState({ loadingGamesOfTheWeek: false }))
    }

    renderMyGames() {
        if (this.state.myGames.length > 0)
            return <GameCollectionNoWrap games={this.state.myGames} region={"au"} />
        else
            return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300, color: darkerTextColor }}>
                No games are planned today
            </div>
    }

    renderGamesOfTheWeek() {
        if (this.state.gamesOfTheWeek.length > 0)
            return <GameCollectionNoWrap games={this.state.gamesOfTheWeek} region={"au"} />
        else
            return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300, color: darkerTextColor }}>
                No games are planned this week
            </div>
    }

    renderContent() {
        if (this.state.user) {
            return (
                <div style={{ paddingTop: 16 }}>
                    <OrganizeForm show={this.state.showPostDialog} uid={this.state.user.id} posted={() => {
                        this.setState({ showPostDialog: false })
                        this.showSnackSuccessMsg("The game has been organized successfully")
                        this.fetchMyGames()
                        this.fetchWeekGames()
                    }} onClose={() => this.setState({ showPostDialog: false })} />
                    <Typography component={"div"} variant="h4" style={{ color: darkerTextColor, fontWeight: "bold", fontFamily: "norwester", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        MY GAMES
                    </Typography>
                    {(this.state.loadingMyGames) ? <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}><CircularProgress style={{ color: backgroundTheme }} /></div> : this.renderMyGames()}
                    <Typography component={"div"} variant="h4" style={{ color: darkerTextColor, fontWeight: "bold", fontFamily: "norwester", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        GAMES THIS WEEK
                    </Typography>
                    {(this.state.loadingGamesOfTheWeek) ? <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}><CircularProgress style={{ color: backgroundTheme }} /></div> : this.renderGamesOfTheWeek()}
                    <Fab aria-label={"Add"} style={{
                        position: 'absolute',
                        bottom: 80,
                        right: (isMobile) ? 30 : 550,
                        backgroundColor: backgroundTheme,
                        color: "white"
                    }} onClick={() => {
                        this.setState({ showPostDialog: true })
                    }}>
                        <AddTwoTone />
                    </Fab>
                </div >
            )
        } else
            return (
                <div style={{ paddingTop: 16 }}>
                    <Typography component={"div"} variant="h4" style={{ color: darkerTextColor, fontWeight: "bold", fontFamily: "norwester", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        GAMES THIS WEEK
                    </Typography>
                    {(this.state.loadingGamesOfTheWeek) ? <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}><CircularProgress style={{ color: backgroundTheme }} /></div> : this.renderGamesOfTheWeek()}
                </div >
            )
    }
}

export default withStyles(styles, { withTheme: true })(withRouter(HomeView));