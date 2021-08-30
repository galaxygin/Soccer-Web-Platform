import { Fab, Typography, Snackbar, CircularProgress } from '@material-ui/core'
import { AddTwoTone } from '@material-ui/icons'
import Alert from '@material-ui/lab/Alert'
import { User } from '@supabase/supabase-js'
import React, { useState } from 'react'
import { isMobile } from 'react-device-detect'
import { getGamesOfTheWeek, getMyGames } from '../../api/request/GameTestRequest'
import { GameCollectionNoWrap } from '../../components/GameList'
import OrganizeForm from '../../components/OrganizeForm'
import { PageBaseFunction } from '../../components/PageBase'
import { GameHeader } from '../../Definitions'
import { backgroundTheme, darkerTextColor, useStyles } from '../../public/assets/styles/styles.web'

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
      return <GameCollectionNoWrap games={myGames} region={"jp"} />
    else
      return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300, color: darkerTextColor }}>
        ゲームの取得に失敗したか、あなたが参加・主催しているゲームはありません。
      </div>
  }

  function renderGamesOfTheWeek() {
    if (gamesOfTheWeek.length > 0)
      return <GameCollectionNoWrap games={gamesOfTheWeek} region={"jp"} />
    else
      return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300, color: darkerTextColor }}>
        ゲームの取得に失敗したか、今週予定されてるゲームはありません。
      </div>
  }

  function content() {
    if (user) {
      return (
        <div style={{ paddingTop: 16 }}>
          <OrganizeForm show={postDialog} uid={user.id} region={"jp"} posted={() => {
            openPostDialog(false)
            openSnackbar(true)
            fetchMyGames(user.id)
            fetchWeekGames()
          }} onClose={() => openPostDialog(false)} />
          <Typography component={"div"} variant="h4" style={{ color: darkerTextColor, fontWeight: "bold", fontFamily: "norwester", display: "flex", alignItems: "center", justifyContent: "center" }}>
            マイゲーム
          </Typography>
          {(loadingMyGames) ? <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}><CircularProgress style={{ color: backgroundTheme }} /></div> : renderMyGames()}
          <Typography component={"div"} variant="h4" style={{ color: darkerTextColor, fontWeight: "bold", fontFamily: "norwester", display: "flex", alignItems: "center", justifyContent: "center" }}>
            今週のゲーム
          </Typography>
          {(loadingGamesOfTheWeek) ? <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}><CircularProgress style={{ color: backgroundTheme }} /></div> : renderGamesOfTheWeek()}
          <Snackbar open={showSnackbar} autoHideDuration={6000} onClose={() => openSnackbar(false)}>
            <Alert onClose={() => openSnackbar(false)} severity="success">ゲームの企画に成功しました。</Alert>
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
            {<AddTwoTone />}
          </Fab>
        </div >
      )
    } else {
      return <div style={{ paddingTop: 16 }}>
        <Typography component={"div"} variant="h4" style={{ color: darkerTextColor, fontWeight: "bold", fontFamily: "norwester", display: "flex", alignItems: "center", justifyContent: "center" }}>
          今週のゲーム
        </Typography>
        {(loadingGamesOfTheWeek) ? <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}><CircularProgress style={{ color: backgroundTheme }} /></div> : renderGamesOfTheWeek()}
        <Snackbar open={showSnackbar} autoHideDuration={6000} onClose={() => openSnackbar(false)}>
          <Alert onClose={() => openSnackbar(false)} severity="success">ゲームの企画に成功しました。</Alert>
        </Snackbar>
      </div >
    }
  }

  return <PageBaseFunction content={content()} region={"jp"} onStateChanged={user => {
    if (user) {
      fetchMyGames(user.id)
    }
    setUser(user)
    fetchWeekGames()
  }} />
}
