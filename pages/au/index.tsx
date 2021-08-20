import { Fab, Typography, Snackbar, CircularProgress } from '@material-ui/core'
import { AddTwoTone } from '@material-ui/icons'
import Alert from '@material-ui/lab/Alert'
import React, { useState, useEffect } from 'react'
import { useCookies } from 'react-cookie'
import { isMobile } from 'react-device-detect'
import { getUser } from '../../api/request/AuthRequest'
import { getGamesOfTheWeek, getMyGames } from '../../api/request/GameTestRequest'
import { GameCollectionNoWrap } from '../../components/GameList'
import OrganizeFormAU from '../../components/OrganizeForm'
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
  const [cookies, setCookie, removeCookie] = useCookies(['uid'])

  const [postDialog, openPostDialog] = useState(false)
  const [showSnackbar, openSnackbar] = useState(false)

  useEffect(() => {
    fetchMyGames()
    fetchWeekGames()
  }, [])

  function fetchMyGames() {
    setLoadingMyGames(true)
    getMyGames(cookies.uid).then(games => setMyGames(games)).catch(error => console.log(error.message)).finally(() => setLoadingMyGames(false))
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
    return (
      <div style={{ paddingTop: 16 }}>
        <OrganizeFormAU show={postDialog} uid={cookies.uid} posted={() => {
          openPostDialog(false)
          openSnackbar(true)
          fetchMyGames()
          fetchWeekGames()
        }} onClose={() => openPostDialog(false)} />
        {(getUser()) ? <>
          <Typography component={"div"} variant="h4" style={{ color: darkerTextColor, fontWeight: "bold", fontFamily: "norwester", display: "flex", alignItems: "center", justifyContent: "center" }}>
            MY GAMES
          </Typography>
          {(loadingMyGames) ? <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}><CircularProgress style={{ color: backgroundTheme }} /></div> : renderMyGames()}
        </> : null}
        <Typography component={"div"} variant="h4" style={{ color: darkerTextColor, fontWeight: "bold", fontFamily: "norwester", display: "flex", alignItems: "center", justifyContent: "center" }}>
          GAMES THIS WEEK
        </Typography>
        {(loadingGamesOfTheWeek) ? <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}><CircularProgress style={{ color: backgroundTheme }} /></div> : renderGamesOfTheWeek()}
        <Snackbar open={showSnackbar} autoHideDuration={6000} onClose={() => openSnackbar(false)}>
          <Alert onClose={() => openSnackbar(false)} severity="success">The game has been organized successfully</Alert>
        </Snackbar>
        {(getUser()) ?
          <Fab aria-label={"Add"} style={{
            position: 'absolute',
            bottom: 80,
            right: (isMobile) ? 30 : 550,
            backgroundColor: backgroundTheme,
            color: "white"
          }} onClick={() => {
            openPostDialog(true)
          }}>
            {<AddTwoTone />}
          </Fab> : null}
      </div >
    )
  }

  return <PageBase content={content()} region={"au"} />
}
