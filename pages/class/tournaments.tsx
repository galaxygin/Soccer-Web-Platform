import DateFnsUtils from "@date-io/date-fns";
import { CircularProgress, Fab, IconButton, MenuItem, TextField, Typography, withStyles } from "@material-ui/core";
import { AddTwoTone, ChevronLeft, Close } from "@material-ui/icons";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from "@material-ui/pickers";
import { withRouter } from "next/router";
import React from "react";
import { isMobile } from "react-device-detect";
import { searchGames } from "../../api/request/GameTestRequest";
import { GameCollection, GameCollectionNoWrap } from "../../components/GameList";
import OrganizeForm from "../../components/OrganizeForm";
import { GameHeader } from "../../Definitions";
import { darkerTextColor, backgroundTheme } from "../../public/assets/styles/styles.web";
import PageBaseClass, { BaseProps, BaseStates, styles } from "../../components/PageBase";

interface States extends BaseStates {
    loadingMyTournaments: boolean
    myTournaments: GameHeader[]
    loadingTournaments: boolean
    tournaments: GameHeader[]
    openingSearch: boolean
    searchText: string
    location: string
    level: number
    date: Date
    time: string
    searchResult: GameHeader[]
    searching: boolean
    showPostDialog: boolean
}

class TournamentsView extends PageBaseClass<BaseProps, States> {
    state: States = {
        region: "class",
        selectedNavValue: "games",
        loadingMyTournaments: true,
        myTournaments: [],
        loadingTournaments: true,
        tournaments: [],
        openingSearch: false,
        searchText: "",
        location: "",
        level: 0,
        date: new Date(),
        time: "",
        searchResult: [],
        searching: false,
        showPostDialog: false
    }

    onBaseLoaded() {
        if (this.state.user)
            this.fetchMyTournaments()
        this.fetchTournaments()
    }

    fetchMyTournaments() {
        // this.setState({ loadingMyTournaments: true })
        // getMyTournaments().then(games => this.setState({ myTournaments: games })).catch(error => this.showSnackErrorMsg(error.message)).finally(() => this.setState({ loadingMyTournaments: false }))
    }

    fetchTournaments() {
        // this.setState({ loadingTournaments: true })
        // getTournaments().then(games => this.setState({ tournaments: games })).catch(error => this.showSnackErrorMsg(error.message)).finally(() => this.setState({ loadingTournaments: false }))
    }

    fetchSearchGames() {
        if (this.state.searching)
            return
        this.setState({ searching: true })
        searchGames(this.state.searchText, this.state.level, this.state.date, this.state.location, this.state.time).then(games => this.setState({ searchResult: games })).catch(error => this.showSnackErrorMsg(error.message)).finally(() => this.setState({ searching: false }))
    }

    renderMyTournaments() {
        if (this.state.myTournaments.length > 0)
            return <GameCollectionNoWrap games={this.state.myTournaments} region={this.state.region} />
        else
            return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300, color: darkerTextColor }}>
                No games are planned today
            </div>
    }

    renderTournaments() {
        if (this.state.tournaments.length > 0)
            return <GameCollectionNoWrap games={this.state.tournaments} region={this.state.region} />
        else
            return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300, color: darkerTextColor }}>
                No games are planned this week
            </div>
    }

    renderSearchResult() {
        if (this.state.searchResult.length > 0)
            return <div>
                {this.renderFilters()}
                <GameCollection games={this.state.searchResult} region={this.state.region} />
            </div>
        else
            return <div>
                {this.renderFilters()}
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300, color: darkerTextColor }}>
                    No games are found
                </div>
            </div>
    }

    renderFilters() {
        return <div style={{ display: "flex", flexDirection: "row", alignItems: "center", marginLeft: 8, marginRight: 8, flexWrap: "wrap", borderColor: "silver", borderWidth: 1, borderStyle: "solid", borderRadius: 15, padding: 8 }}>
            <IconButton onClick={() => {
                this.setState({ location: "", level: 0, date: new Date(), time: "" }, () => this.fetchSearchGames())
            }}>
                <Close />
            </IconButton>
            <TextField label="Location" variant="outlined" onChange={e => this.setState({ location: e.target.value }, () => this.fetchSearchGames())} value={this.state.location} />
            <TextField label="Player level" variant="outlined" onChange={e => this.setState({ level: parseInt(e.target.value) }, () => this.fetchSearchGames())} value={this.state.level} select style={{ marginLeft: 8 }}>
                <MenuItem key={0} value={0}>Anyone</MenuItem>
                <MenuItem key={1} value={1}>Mid level</MenuItem>
                <MenuItem key={2} value={2}>High level</MenuItem>
                <MenuItem key={3} value={3}>Professional level</MenuItem>
            </TextField>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDatePicker
                    disableToolbar
                    variant="inline"
                    format="yyyy-MM-dd"
                    margin="none"
                    id="date-picker-inline"
                    label="Date from"
                    value={this.state.date}
                    onChange={(date: Date | null) => this.setState({ date: date! }, () => this.fetchSearchGames())}
                    KeyboardButtonProps={{
                        'aria-label': 'change date',
                    }}
                    style={{ width: 140, marginLeft: 8 }}
                />
            </MuiPickersUtilsProvider>
            <TextField label="Time from" variant="outlined" onChange={e => this.setState({ time: e.target.value }, () => this.fetchSearchGames())} defaultValue={this.state.time} type="time" style={{ width: 100, marginLeft: 8 }} />
        </div>
    }

    renderContent() {
        return (
            <div style={{ paddingTop: 16 }}>
                {(this.state.user) ? <OrganizeForm show={this.state.showPostDialog} uid={this.state.user.id} posted={() => {
                    this.setState({ showPostDialog: false })
                    this.showSnackSuccessMsg("The game has been organized successfully")
                    this.fetchMyTournaments()
                    this.fetchTournaments()
                }} onClose={() => this.setState({ showPostDialog: false })} /> : null}
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", flexWrap: "nowrap" }}>
                    {(this.state.openingSearch) ? <IconButton style={{ marginLeft: 16 }} onClick={() => {
                        this.setState({ openingSearch: false, searchText: "" })
                    }}><ChevronLeft /></IconButton> : null}
                    <TextField label="Search games..." variant="outlined" className={this.styles.formTextField} onChange={e => {
                        this.setState({ openingSearch: true, searchText: e.target.value }, () => this.fetchSearchGames())
                    }} value={this.state.searchText} style={{ margin: 32, marginLeft: (this.state.openingSearch) ? 16 : 32 }} fullWidth />
                </div>
                {(this.state.openingSearch) ? this.renderSearchResult() : <>
                    <Typography component={"div"} variant="h4" style={{ color: darkerTextColor, fontWeight: "bold", fontFamily: "norwester", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        MY TORNAMENTS
                    </Typography>
                    {(this.state.loadingMyTournaments) ? <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}><CircularProgress style={{ color: backgroundTheme }} /></div> : this.renderMyTournaments()}
                    <Typography component={"div"} variant="h4" style={{ color: darkerTextColor, fontWeight: "bold", fontFamily: "norwester", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        TOURNAMENTS
                    </Typography>
                    {(this.state.loadingTournaments) ? <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}><CircularProgress style={{ color: backgroundTheme }} /></div> : this.renderTournaments()}
                    {(this.state.user) ? <Fab aria-label={"Add"} style={{
                        position: 'absolute',
                        bottom: 80,
                        right: (isMobile) ? 30 : 550,
                        backgroundColor: backgroundTheme,
                        color: "white"
                    }} onClick={() => {
                        this.setState({ showPostDialog: true })
                    }}>
                        <AddTwoTone />
                    </Fab> : null}
                </>}
            </div >
        )
    }
}

export default withStyles(styles, { withTheme: true })(withRouter(TournamentsView));