import { Fab, Typography, Snackbar, CircularProgress } from '@material-ui/core'
import { AddTwoTone } from '@material-ui/icons'
import Alert from '@material-ui/lab/Alert'
import { User } from '@supabase/supabase-js'
import React, { useState } from 'react'
import { isMobile } from 'react-device-detect'
import { getGamesOfTheWeek, getMyGames } from '../../api/request/GameTestRequest'
import { GameCollectionNoWrap } from '../../components/GameList'
import OrganizeForm from '../../components/OrganizeForm'
import { GameHeader } from '../../Definitions'
import { backgroundTheme, darkerTextColor, useStyles } from '../../public/assets/styles/styles.web'
import PageBase from '../PageBase'

const games = [{
  id: '1',
  organizer: "Perra",
  title: "Test",
  description: "Setumei",
  location: "Sydney",
  date: new Date(),
  time: new Date(),
  player_level: 0,
  passcode: null,
  max_players: null,
  min_players: null,
  custom_rules: "No hands",
  requirements: null,
  participants: 1
}]

export default function HomeView() {
  const styles = useStyles()
  const [loadingMyGames, setLoadingMyGames] = useState(true)
  const [myGames, setMyGames] = useState<GameHeader[]>([])
  const [loadingGamesOfTheWeek, setLoadingGamesOfTheWeek] = useState(true)
  const [gamesOfTheWeek, setGamesOfTheWeek] = useState<GameHeader[]>([])
  const [user, setUser] = useState<User | null>()

  const [postDialog, openPostDialog] = useState(false)
  const [showSnackbar, openSnackbar] = useState(false)

  function fetchMyGames(uid: string) {
    setLoadingMyGames(true)
    getMyGames(uid).then(games => setMyGames(games)).catch(error => console.log(error.message)).finally(() => setLoadingMyGames(false))
  }

  function fetchWeekGames() {
    setLoadingGamesOfTheWeek(true)
    getGamesOfTheWeek().then(games => setGamesOfTheWeek(games)).catch(error => console.log(error.message)).finally(() => setLoadingGamesOfTheWeek(false))
  }

  function renderMyGames() {
    if (myGames.length > 0)
      return <GameCollectionNoWrap games={myGames} region={"au"} />
    else
      return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300, color: darkerTextColor }}>
        No games are planned today
      </div>
  }

  function renderGamesOfTheWeek() {
    if (gamesOfTheWeek.length > 0)
      return <GameCollectionNoWrap games={gamesOfTheWeek} region={"au"} />
    else
      return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300, color: darkerTextColor }}>
        No games are planned this week
      </div>
  }

  function content() {
    if (user) {
      return (
        <div style={{ paddingTop: 16 }}>
          <OrganizeForm show={postDialog} uid={user.id} posted={() => {
            openPostDialog(false)
            openSnackbar(true)
            fetchMyGames(user.id)
            fetchWeekGames()
          }} onClose={() => openPostDialog(false)} />
          <Typography component={"div"} variant="h4" style={{ color: darkerTextColor, fontWeight: "bold", fontFamily: "norwester", display: "flex", alignItems: "center", justifyContent: "center" }}>
            MY GAMES
          </Typography>
          {(loadingMyGames) ? <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}><CircularProgress style={{ color: backgroundTheme }} /></div> : renderMyGames()}
          <Typography component={"div"} variant="h4" style={{ color: darkerTextColor, fontWeight: "bold", fontFamily: "norwester", display: "flex", alignItems: "center", justifyContent: "center" }}>
            GAMES THIS WEEK
          </Typography>
          {(loadingGamesOfTheWeek) ? <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}><CircularProgress style={{ color: backgroundTheme }} /></div> : renderGamesOfTheWeek()}
          <Snackbar open={showSnackbar} autoHideDuration={6000} onClose={() => openSnackbar(false)}>
            <Alert onClose={() => openSnackbar(false)} severity="success">The game has been organized successfully</Alert>
          </Snackbar>
          <Fab aria-label={"Add"} style={{
            position: 'absolute',
            bottom: 80,
            right: (isMobile) ? 30 : 550,
            backgroundColor: backgroundTheme,
            color: "white"
          }} onClick={() => {
            openPostDialog(true)
          }}>
            <AddTwoTone />
          </Fab>
        </div >
      )
    } else {
      return (
        <div style={{ paddingTop: 16 }}>
          <Typography component={"div"} variant="h4" style={{ color: darkerTextColor, fontWeight: "bold", fontFamily: "norwester", display: "flex", alignItems: "center", justifyContent: "center" }}>
            GAMES THIS WEEK
          </Typography>
          {(loadingGamesOfTheWeek) ? <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}><CircularProgress style={{ color: backgroundTheme }} /></div> : renderGamesOfTheWeek()}
          <Snackbar open={showSnackbar} autoHideDuration={6000} onClose={() => openSnackbar(false)}>
            <Alert onClose={() => openSnackbar(false)} severity="success">The game has been organized successfully</Alert>
          </Snackbar>
        </div >
      )
    }
  }

  return <PageBase content={content()} region={"au"} onStateChanged={user => {
    if (user) {
      fetchMyGames(user.id)
    }
    setUser(user)
    fetchWeekGames()
  }} />
}
