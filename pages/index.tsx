import DateFnsUtils from '@date-io/date-fns'
import { Fab, ImageList, ImageListItem, Link, Dialog, Typography, DialogTitle, DialogContent, DialogActions, Button, TextField, Snackbar, MenuItem, CircularProgress } from '@material-ui/core'
import { AddTwoTone, LockTwoTone } from '@material-ui/icons'
import Alert from '@material-ui/lab/Alert'
import { KeyboardDatePicker, KeyboardTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers'
import Image from 'next/image'
import React, { useState, useEffect } from 'react'
import { useCookies } from 'react-cookie'
import { isMobile } from 'react-device-detect'
import { getUser } from '../api/request/AuthRequest'
import { getTodaysGames, getGamesOfTheWeek, organizeGame } from '../api/request/GameRequest'
import { removeSecondsFromTime } from '../components/DateManager'
import { Game } from '../Definitions'
import { backgroundTheme, darkerTextColor, defaultTheme, useStyles } from '../public/assets/styles/styles.web'
import PageBase from './PageBase'

const games = [{
  id: '1',
  organizer: "Perra",
  title: "Test",
  description: "Setumei",
  location: "Sydney",
  date: new Date(),
  time: new Date(),
  playerLevel: 0,
  passcode: null,
  maxPlayers: null,
  minPlayers: null,
  customRules: "No hands",
  requirements: null,
  participants: 1
}]

export default function Home() {
  const styles = useStyles()
  const [size, setSize] = useState(0)
  const [loadingTodaysGames, setLoadingTodaysGames] = useState(true)
  const [todaysGames, setTodaysGames] = useState<Game[]>([])
  const [loadingGamesOfTheWeek, setLoadingGamesOfTheWeek] = useState(true)
  const [gamesOfTheWeek, setGamesOfTheWeek] = useState<Game[]>([])
  const [cookies, setCookie, removeCookie] = useCookies(['uid'])

  const [postDialog, openPostDialog] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [date, setDate] = useState<Date>(new Date())
  const [time, setTime] = useState<Date>(new Date())
  const [playerLevel, setPlayerLevel] = useState(0)
  const [passcode, setPasscode] = useState<string | null>(null)
  const [maxPlayers, setMaxPlayers] = useState<number | null>(null)
  const [minPlayers, setMinPlayers] = useState<number | null>(null)
  const [customRules, setCustomRules] = useState<string | null>(null)
  const [requirements, setRequirements] = useState<string | null>(null)
  const [posting, setPosting] = useState(false)
  const [showSnackbar, openSnackbar] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)

  const [showSigninDialog, openSigninDialog] = useState(false)

  useEffect(() => {
    getTodaysGames().then(games => setTodaysGames(games)).catch(error => console.log(error.message)).finally(() => setLoadingTodaysGames(false))
    getGamesOfTheWeek().then(games => setGamesOfTheWeek(games)).catch(error => console.log(error.message)).finally(() => setLoadingGamesOfTheWeek(false))
    function handleResize() {
      setSize((isMobile) ? window.innerWidth * 0.8 : window.innerWidth * 0.20)
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [])

  function renderTodaysGame() {
    if (todaysGames.length > 0)
      return <ImageList style={{ marginTop: 16, marginBottom: 16, width: "100%", flexWrap: "nowrap" }} gap={5}>
        {todaysGames.map(game => {
          if (game.passcode)
            return <ImageListItem style={{ width: size, height: 300, backgroundColor: defaultTheme, borderColor: "black", borderWidth: 1, borderStyle: "solid" }} key={game.id}>
              <Link href={"/game?id=" + game.id + "&needPasscode=true"}>
                <Image src={"/assets/images/SoccerFieldLandscape.jpg"} width={size} height={200} />
                <div style={{ display: "flex", flexDirection: "row", flexWrap: "nowrap" }}>
                  <Typography style={{ color: darkerTextColor, fontWeight: "bold", flex: 1, overflow: "hidden" }}>
                    {game.title}
                  </Typography>
                  <LockTwoTone style={{ color: "gray" }} />
                </div>
                <Typography style={{ color: darkerTextColor }}>
                  {game.organizer.name}<br />
                  {game.date}
                </Typography>
              </Link>
            </ImageListItem>
          else
            return <ImageListItem style={{ width: size, height: 300, backgroundColor: defaultTheme, borderColor: "black", borderWidth: 1, borderStyle: "solid" }} key={game.id}>
              <Link href={"/game?id=" + game.id}>
                <Image src={"/assets/images/SoccerFieldLandscape.jpg"} width={size} height={200} />
                <Typography style={{ color: darkerTextColor, fontWeight: "bold", overflow: "hidden" }}>
                  {game.title}
                </Typography>
                <Typography style={{ color: darkerTextColor }}>
                  {game.organizer.name}<br />
                  {game.location}
                </Typography>
                <Typography style={{ display: "flex", flexDirection: "row", color: darkerTextColor }}>
                  {game.date + " " + removeSecondsFromTime(game.time)}<div style={{ flex: 1 }} />{game.participants + " players joining"}
                </Typography>
              </Link>
            </ImageListItem>
        })}
      </ImageList>
    else
      return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300, color: darkerTextColor }}>
        No games are planned today
      </div>
  }

  function renderGamesOfTheWeek() {
    if (gamesOfTheWeek.length > 0)
      return <ImageList style={{ marginTop: 16, marginBottom: 16, width: "100%", flexWrap: "nowrap" }} gap={5}>
        {gamesOfTheWeek.map(game => {
          if (game.passcode)
            return <ImageListItem style={{ width: size, height: 300, backgroundColor: defaultTheme, borderColor: "black", borderWidth: 1, borderStyle: "solid" }} key={game.id}>
              <Link href={"/game?id=" + game.id + "&needPasscode=true"}>
                <Image src={"/assets/images/SoccerFieldLandscape.jpg"} width={size} height={200} />
                <div style={{ display: "flex", flexDirection: "row", flexWrap: "nowrap" }}>
                  <Typography style={{ color: darkerTextColor, fontWeight: "bold", flex: 1, overflow: "hidden" }}>
                    {game.title}
                  </Typography>
                  <LockTwoTone style={{ color: "gray" }} />
                </div>
                <Typography style={{ color: darkerTextColor }}>
                  {game.organizer.name}<br />
                  {game.date}
                </Typography>
              </Link>
            </ImageListItem>
          else
            return <ImageListItem style={{ width: size, height: 300, backgroundColor: defaultTheme, borderColor: "black", borderWidth: 1, borderStyle: "solid" }} key={game.id}>
              <Link href={"/game?id=" + game.id}>
                <Image src={"/assets/images/SoccerFieldLandscape.jpg"} width={size} height={200} />
                <Typography style={{ color: darkerTextColor, fontWeight: "bold", overflow: "hidden" }}>
                  {game.title}
                </Typography>
                <Typography style={{ color: darkerTextColor }}>
                  {game.organizer.name}<br />
                  {game.location}
                </Typography>
                <Typography style={{ display: "flex", flexDirection: "row", color: darkerTextColor }}>
                  {game.date + " " + removeSecondsFromTime(game.time)}<div style={{ flex: 1 }} />{game.participants + " players joining"}
                </Typography>
              </Link>
            </ImageListItem>
        })}
      </ImageList>
    else
      return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300, color: darkerTextColor }}>
        No games are planned this week
      </div>
  }
  function content() {
    return (
      <div style={{ paddingTop: 16 }}>
        <Dialog open={postDialog} onClose={() => openPostDialog(false)} fullScreen>
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
              <KeyboardTimePicker
                format="HH:mm"
                margin="normal"
                id="time-picker"
                label="Time"
                value={time}
                onChange={(time: Date | null) => setTime(time!)}
                KeyboardButtonProps={{
                  'aria-label': 'change time',
                }}
                style={{ color: darkerTextColor }}
              />
            </MuiPickersUtilsProvider>
            {/* <TextField id="datetime-local" label="Game schedule" variant="outlined" className={styles.formTextField} onChange={e => setDatetime(new Date(e.target.value))} value={format(datetime, "yyyy-MM-dd'T'HH:mm")} fullWidth type="datetime-local" /> */}
            <TextField label="Player level" variant="outlined" className={styles.formTextField} onChange={e => setPlayerLevel(parseInt(e.target.value))} value={playerLevel} fullWidth select>
              <MenuItem key={0} value={0}>Anyone</MenuItem>
              <MenuItem key={1} value={1}>Mid level</MenuItem>
              <MenuItem key={2} value={2}>High level</MenuItem>
              <MenuItem key={3} value={3}>Professional level</MenuItem>
            </TextField>
            <Typography variant="h5" style={{ marginTop: 16 }}>
              Optional (Leave it blank to disable it)
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Typography variant="h4" style={{ color: darkerTextColor, fontWeight: "bold", fontFamily: "norwester" }}>
            TODAY'S GAMES
          </Typography>
        </div>
        {(loadingTodaysGames) ? <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}><CircularProgress style={{ color: backgroundTheme }} /></div> : renderTodaysGame()}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Typography variant="h4" style={{ color: darkerTextColor, fontWeight: "bold", fontFamily: "norwester" }}>
            GAMES THIS WEEK
          </Typography>
        </div>
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
          if (getUser()) {
            openPostDialog(true)
          } else {
            // EventRegister.emit('wanna open signin dialog', true)
          }
          openPostDialog(true)
        }}>
          {<AddTwoTone />}
        </Fab>
      </div >
    )
  }

  return <PageBase content={content()} wannaShowSigninDialog={showSigninDialog} />
}
