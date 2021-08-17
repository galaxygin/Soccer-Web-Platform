import DateFnsUtils from "@date-io/date-fns"
import { Dialog, DialogTitle, DialogContent, TextField, MenuItem, Typography, DialogActions, Button, CircularProgress, AppBar, IconButton, Toolbar } from "@material-ui/core"
import { Close } from "@material-ui/icons"
import { Alert } from "@material-ui/lab"
import { MuiPickersUtilsProvider, KeyboardDatePicker } from "@material-ui/pickers"
import React, { useState } from "react"
import { organizeGame } from "../api/request/GameRequest"
import { backgroundTheme, useStyles } from "../public/assets/styles/styles.web"
import { formatTimeToString } from "./DateManager"

interface props {
    uid: string
    _title: string
    _description: string
    _location: string
    _date: Date
    _time: Date
    _playerLevel: number
    _passcode: string
    _maxPlayers: number
    _minPlayers: number
    _customRules: string
    _requirements: string
    editing?: boolean
    posted: Promise<void>
}

export default function OrganizeForm({ uid, _title, _description, _location, _date, _time, _playerLevel, _passcode, _maxPlayers, _minPlayers, _customRules, _requirements, posted }: props) {
    const styles = useStyles()
    const [title, setTitle] = useState(_title)
    const [description, setDescription] = useState(_description)
    const [location, setLocation] = useState(_location)
    const [date, setDate] = useState<Date>(_date)
    const [time, setTime] = useState(formatTimeToString(_time))
    const [playerLevel, setPlayerLevel] = useState(_playerLevel)
    const [passcode, setPasscode] = useState<string | null>(_passcode)
    const [maxPlayers, setMaxPlayers] = useState<number | null>(_maxPlayers)
    const [minPlayers, setMinPlayers] = useState<number | null>(_minPlayers)
    const [customRules, setCustomRules] = useState<string | null>(_customRules)
    const [requirements, setRequirements] = useState<string | null>(_requirements)
    const [posting, setPosting] = useState(false)
    const [errorMsg, setErrorMsg] = useState(null)

    return (
        <>
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
                {(posting) ? <CircularProgress style={{ color: backgroundTheme }} /> : <Button style={{ backgroundColor: "red", color: "white" }} onClick={() => {
                    setPosting(true)
                    organizeGame(uid, title, description, location, date, time, playerLevel, passcode, maxPlayers, minPlayers, customRules, requirements).then(() => {
                        setTitle("")
                        setDescription("")
                        setLocation("")
                        setPlayerLevel(0)
                        setPasscode(null)
                        setMaxPlayers(null)
                        setMinPlayers(null)
                        setCustomRules(null)
                        setRequirements(null)
                        posted = new Promise(resolve => resolve())
                    }).catch(error => setErrorMsg(error.message)).finally(() => setPosting(false))
                }}>Post</Button>}
            </DialogActions>
        </>
    )
}