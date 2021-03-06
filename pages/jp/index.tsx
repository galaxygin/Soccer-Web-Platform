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
import { darkerTextColor, backgroundTheme, classStyles } from "../../public/assets/styles/styles.web";
import PageBaseClass, { BaseProps, BaseStates } from "../../components/PageBase";

interface States extends BaseStates {
  loadingMyGames: boolean
  myGames: GameHeader[]
  loadingGamesOfTheWeek: boolean
  gamesOfTheWeek: GameHeader[]
  showPostDialog: boolean
}

class HomeView extends PageBaseClass<BaseProps, States> {
  state: States = {
    region: "jp",
    language: "Japanese",
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
    getMyGames(this.state.user!.id).then(games => this.setState({ myGames: games })).catch(error => this.showSnackErrorMsg(error.message)).finally(() => this.setState({ loadingMyGames: false }))
  }

  fetchWeekGames() {
    this.setState({ loadingGamesOfTheWeek: true })
    getGamesOfTheWeek().then(games => this.setState({ gamesOfTheWeek: games })).catch(error => this.showSnackErrorMsg(error.message)).finally(() => this.setState({ loadingGamesOfTheWeek: false }))
  }

  renderMyGames() {
    if (this.state.myGames.length > 0)
      return <GameCollectionNoWrap games={this.state.myGames} region={this.state.region} />
    else
      return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300, color: darkerTextColor }}>
        ????????????????????????????????????????????????????????????????????????????????????????????????????????????
      </div>
  }

  renderGamesOfTheWeek() {
    if (this.state.gamesOfTheWeek.length > 0)
      return <GameCollectionNoWrap games={this.state.gamesOfTheWeek} region={this.state.region} />
    else
      return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300, color: darkerTextColor }}>
        ?????????????????????????????????????????????????????????????????????????????????????????????
      </div>
  }

  renderContent() {
    if (this.state.user) {
      return (
        <div style={{ paddingTop: 16 }}>
          <OrganizeForm show={this.state.showPostDialog} uid={this.state.user.id} posted={() => {
            this.setState({ showPostDialog: false })
            this.showSnackSuccessMsg("???????????????????????????????????????")
            this.fetchMyGames()
            this.fetchWeekGames()
          }} onClose={() => this.setState({ showPostDialog: false })} />
          <Typography component={"div"} variant="h4" style={{ color: darkerTextColor, fontWeight: "bold", fontFamily: "norwester", display: "flex", alignItems: "center", justifyContent: "center" }}>
            ???????????????
          </Typography>
          {(this.state.loadingMyGames) ? <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}><CircularProgress style={{ color: backgroundTheme }} /></div> : this.renderMyGames()}
          <Typography component={"div"} variant="h4" style={{ color: darkerTextColor, fontWeight: "bold", fontFamily: "norwester", display: "flex", alignItems: "center", justifyContent: "center" }}>
            ??????????????????
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
            ??????????????????
          </Typography>
          {(this.state.loadingGamesOfTheWeek) ? <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}><CircularProgress style={{ color: backgroundTheme }} /></div> : this.renderGamesOfTheWeek()}
        </div >
      )
  }
}

export default withStyles(classStyles, { withTheme: true })(withRouter(HomeView))