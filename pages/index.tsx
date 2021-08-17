import DateFnsUtils from '@date-io/date-fns'
import { Fab, Dialog, Typography, DialogTitle, DialogContent, DialogActions, Button, TextField, Snackbar, MenuItem, CircularProgress, AppBar, IconButton, Toolbar } from '@material-ui/core'
import { AddTwoTone, Close } from '@material-ui/icons'
import Alert from '@material-ui/lab/Alert'
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers'
import React, { useState, useEffect } from 'react'
import { useCookies } from 'react-cookie'
import { isMobile } from 'react-device-detect'
import { getUser } from '../api/request/AuthRequest'
import { getGamesOfTheWeek, organizeGame, getMyGames } from '../api/request/GameTestRequest'
import { formatTimeToString } from '../components/DateManager'
import { GameList } from '../components/GameList'
import OrganizeForm from '../components/OrganizeForm'
import { GameHeader } from '../Definitions'
import { backgroundTheme, darkerTextColor, useStyles } from '../public/assets/styles/styles.web'
import PageBase from './PageBase'

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
  const [size, setSize] = useState(0)
  const [loadingMyGames, setLoadingMyGames] = useState(true)
  const [myGames, setMyGames] = useState<GameHeader[]>([])
  const [loadingGamesOfTheWeek, setLoadingGamesOfTheWeek] = useState(true)
  const [gamesOfTheWeek, setGamesOfTheWeek] = useState<GameHeader[]>([])
  const [cookies, setCookie, removeCookie] = useCookies(['uid'])

  const [postDialog, openPostDialog] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [date, setDate] = useState<Date>(new Date())
  const [time, setTime] = useState(formatTimeToString(new Date()))
  const [playerLevel, setPlayerLevel] = useState(0)
  const [passcode, setPasscode] = useState<string | null>("")
  const [maxPlayers, setMaxPlayers] = useState<number | null>(22)
  const [minPlayers, setMinPlayers] = useState<number | null>(1)
  const [customRules, setCustomRules] = useState<string | null>("")
  const [requirements, setRequirements] = useState<string | null>("")
  const [posting, setPosting] = useState(false)
  const [showSnackbar, openSnackbar] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)

  const [showSigninDialog, openSigninDialog] = useState(false)

  useEffect(() => {
    getMyGames(cookies.uid).then(games => setMyGames(games)).catch(error => console.log(error.message)).finally(() => setLoadingMyGames(false))
    getGamesOfTheWeek().then(games => setGamesOfTheWeek(games)).catch(error => console.log(error.message)).finally(() => setLoadingGamesOfTheWeek(false))
    function handleResize() {
      setSize((isMobile) ? window.innerWidth * 0.8 : window.innerWidth * 0.20)
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [])

  function renderMyGames() {
    if (myGames.length > 0)
      return <GameList games={myGames} size={size} />
    else
      return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300, color: darkerTextColor }}>
        No games are planned today
      </div>
  }

  function renderGamesOfTheWeek() {
    if (gamesOfTheWeek.length > 0)
      return <GameList games={gamesOfTheWeek} size={size} />
    else
      return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300, color: darkerTextColor }}>
        No games are planned this week
      </div>
  }
  function content() {
    return (
      <div style={{ paddingTop: 16 }}>
        <Dialog open={postDialog} onClose={() => openPostDialog(false)} fullScreen>
          {/* <AppBar style={{ position: "relative" }}>
            <Toolbar>
              <IconButton edge="start" color="inherit" onClick={() => openPostDialog(false)} aria-label="close">
                <Close />
              </IconButton>
              <Typography variant="h6" style={{ flex: 1 }}>
                Participants
              </Typography>
            </Toolbar>
          </AppBar> */}
          {/* <OrganizeForm uid={cookies.uid} _title={title} _description={description} /> */}
          <DialogTitle>Organize a game</DialogTitle>
          <DialogContent>
            {(errorMsg) ? <Alert severity="error">{errorMsg}</Alert> : null}
            <TextField label="Title" variant="outlined" className={styles.formTextField} onChange={e => setTitle(e.target.value)} value={title} fullWidth />
            <TextField label="Description" variant="outlined" className={styles.formTextField} onChange={e => setDescription(e.target.value)} value={description} fullWidth multiline minRows={4} />
            <TextField label="Location" variant="outlined" className={styles.formTextField} onChange={e => setLocation(e.target.value)} value={location} fullWidth />
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <KeyboardDatePicker
                disableToolbar
                variant="inline"
                format="yyyy-MM-dd"
                margin="normal"
                id="date-picker-inline"
                label="Date"
                value={date}
                onChange={(date: Date | null) => setDate(date!)}
                KeyboardButtonProps={{
                  'aria-label': 'change date',
                }}
              />
            </MuiPickersUtilsProvider>
            <TextField label="Time" variant="outlined" className={styles.formTextField} onChange={e => setTime(e.target.value)} defaultValue={time} type="time" />
            {/* <TextField id="datetime-local" label="Game schedule" variant="outlined" className={styles.formTextField} onChange={e => setDatetime(new Date(e.target.value))} value={format(datetime, "yyyy-MM-dd'T'HH:mm")} fullWidth type="datetime-local" /> */}
            <TextField label="Player level" variant="outlined" className={styles.formTextField} onChange={e => setPlayerLevel(parseInt(e.target.value))} value={playerLevel} fullWidth select>
              <MenuItem key={0} value={0}>Anyone</MenuItem>
              <MenuItem key={1} value={1}>Mid level</MenuItem>
              <MenuItem key={2} value={2}>High level</MenuItem>
              <MenuItem key={3} value={3}>Professional level</MenuItem>
            </TextField>
            <Typography variant="h5" style={{ marginTop: 16 }}>
              Customize game (Optional)
            </Typography>
            <TextField label="Passcode (To make it private)" variant="outlined" className={styles.formTextField} onChange={e => setPasscode(e.target.value)} value={passcode} fullWidth />
            <TextField label="Max players" variant="outlined" className={styles.formTextField} onChange={e => setMaxPlayers(parseInt(e.target.value))} value={maxPlayers} fullWidth type="number" />
            <TextField label="Min players" variant="outlined" className={styles.formTextField} onChange={e => setMinPlayers(parseInt(e.target.value))} value={minPlayers} fullWidth type="number" />
            <TextField label="Custom rules" variant="outlined" className={styles.formTextField} onChange={e => setCustomRules(e.target.value)} value={customRules} fullWidth multiline minRows={4} />
            <TextField label="Requirements" variant="outlined" className={styles.formTextField} onChange={e => setRequirements(e.target.value)} value={requirements} fullWidth multiline minRows={4} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => openPostDialog(false)}>Cancel</Button>
            <div style={{ flexGrow: 1 }} />
            {(posting) ? <CircularProgress style={{ color: backgroundTheme }} /> : <Button style={{ backgroundColor: "red", color: "white" }} onClick={() => {
              setPosting(true)
              organizeGame(cookies.uid, title, description, location, date, time, playerLevel, passcode, maxPlayers, minPlayers, customRules, requirements).then(() => {
                openPostDialog(false)
                setTitle("")
                setDescription("")
                setLocation("")
                setPlayerLevel(0)
                setPasscode(null)
                setMaxPlayers(null)
                setMinPlayers(null)
                setCustomRules(null)
                setRequirements(null)
                openSnackbar(true)
              }).catch(error => setErrorMsg(error.message)).finally(() => setPosting(false))
            }}>Post</Button>}
          </DialogActions>
        </Dialog>
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

  return <PageBase content={content()} wannaShowSigninDialog={showSigninDialog} />
}
