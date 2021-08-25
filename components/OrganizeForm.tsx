import DateFnsUtils from "@date-io/date-fns"
import { Dialog, DialogContent, TextField, MenuItem, Typography, Button, CircularProgress, AppBar, IconButton, Toolbar } from "@material-ui/core"
import { Close } from "@material-ui/icons"
import { Alert } from "@material-ui/lab"
import { MuiPickersUtilsProvider, KeyboardDatePicker } from "@material-ui/pickers"
import React, { useState } from "react"
import { cancelGame, organizeGame, updateGameDetail } from "../api/request/GameTestRequest"
import { backgroundTheme, useStyles } from "../public/assets/styles/styles.web"
import { formatDateToString, formatTimeToString } from "./DateManager"

interface props {
    show: boolean
    uid: string
    region?: string
    game_id?: string
    _title?: string
    _description?: string
    _location?: string
    _date?: Date
    _time?: string
    _playerLevel?: number
    _passcode?: string
    _maxPlayers?: number
    _minPlayers?: number
    _customRules?: string | null
    _requirements?: string | null
    editing?: boolean
    posted: () => void
    onClose: () => void
    onCancelled?: () => void
}

export default function OrganizeForm({ show, uid, region = "au", game_id, _title = "", _description = "", _location = "", _date = new Date(), _time = formatTimeToString(new Date()), _playerLevel = 0, _passcode = "", _maxPlayers = 22, _minPlayers = 1, _customRules = "", _requirements = "", editing = false, posted, onClose, onCancelled }: props) {
    const styles = useStyles()
    const [title, setTitle] = useState(_title)
    const [description, setDescription] = useState(_description)
    const [location, setLocation] = useState(_location)
    const [date, setDate] = useState<Date>(_date)
    const [time, setTime] = useState(_time)
    const [playerLevel, setPlayerLevel] = useState(_playerLevel)
    const [passcode, setPasscode] = useState<string | null>(_passcode)
    const [maxPlayers, setMaxPlayers] = useState<number | null>(_maxPlayers)
    const [minPlayers, setMinPlayers] = useState<number | null>(_minPlayers)
    const [customRules, setCustomRules] = useState<string | null>(_customRules)
    const [requirements, setRequirements] = useState<string | null>(_requirements)
    const [posting, setPosting] = useState(false)
    const [errorMsg, setErrorMsg] = useState("")

    switch (region) {
        case "jp":
            return (
                <Dialog open={show} onClose={() => onClose()} fullScreen>
                    <AppBar style={{ position: "relative" }}>
                        <Toolbar>
                            <IconButton edge="start" color="inherit" onClick={() => onClose()} aria-label="close">
                                <Close />
                            </IconButton>
                            <Typography variant="h6" style={{ flex: 1 }}>
                                {(editing) ? "ゲームの編集" : "ゲームを作成"}
                            </Typography>
                            {(posting) ? <CircularProgress style={{ color: backgroundTheme }} /> : <Button style={{ backgroundColor: "red", color: "white" }} onClick={() => {
                                if (!title) {
                                    setErrorMsg("タイトルは必須です")
                                    return
                                }
                                if (!description) {
                                    setErrorMsg("説明は必須です")
                                    return
                                }
                                if (!location) {
                                    setErrorMsg("場所は必須です")
                                    return
                                }
                                if (new Date(formatDateToString(date) + "T" + time) < new Date()) {
                                    setErrorMsg("日時が過去のものです")
                                    return
                                }
                                setPosting(true)
                                if (editing) {
                                    updateGameDetail(game_id!, title, description, location, date, time, playerLevel, passcode, maxPlayers, minPlayers, customRules, requirements).then(() => {
                                        setTitle("")
                                        setDescription("")
                                        setLocation("")
                                        setPlayerLevel(0)
                                        setPasscode("")
                                        setMaxPlayers(22)
                                        setMinPlayers(1)
                                        setCustomRules("")
                                        setRequirements("")
                                        posted()
                                    }).catch(error => setErrorMsg(error.message)).finally(() => setPosting(false))
                                } else {
                                    organizeGame(uid, title, description, location, date, time, playerLevel, passcode, maxPlayers, minPlayers, customRules, requirements).then(() => {
                                        setTitle("")
                                        setDescription("")
                                        setLocation("")
                                        setPlayerLevel(0)
                                        setPasscode("")
                                        setMaxPlayers(22)
                                        setMinPlayers(1)
                                        setCustomRules("")
                                        setRequirements("")
                                        posted()
                                    }).catch(error => setErrorMsg(error.message)).finally(() => setPosting(false))
                                }
                            }}>{(editing) ? "更新" : "投稿"}</Button>}
                        </Toolbar>
                    </AppBar>
                    <DialogContent>
                        {(errorMsg) ? <Alert severity="error">{errorMsg}</Alert> : null}
                        <TextField label="タイトル" variant="outlined" className={styles.formTextField} onChange={e => setTitle(e.target.value)} value={title} fullWidth />
                        <TextField label="説明" variant="outlined" className={styles.formTextField} onChange={e => setDescription(e.target.value)} value={description} fullWidth multiline minRows={4} />
                        <TextField label="場所" variant="outlined" className={styles.formTextField} onChange={e => setLocation(e.target.value)} value={location} fullWidth />
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker
                                disableToolbar
                                variant="inline"
                                format="yyyy-MM-dd"
                                margin="normal"
                                id="date-picker-inline"
                                label="日にち"
                                value={date}
                                onChange={(date: Date | null) => setDate(date!)}
                                KeyboardButtonProps={{
                                    'aria-label': 'change date',
                                }}
                            />
                        </MuiPickersUtilsProvider>
                        <TextField label="時間" variant="outlined" className={styles.formTextField} onChange={e => setTime(e.target.value)} defaultValue={time} type="time" />
                        {/* <TextField id="datetime-local" label="Game schedule" variant="outlined" className={styles.formTextField} onChange={e => setDatetime(new Date(e.target.value))} value={format(datetime, "yyyy-MM-dd'T'HH:mm")} fullWidth type="datetime-local" /> */}
                        <TextField label="レベル" variant="outlined" className={styles.formTextField} onChange={e => setPlayerLevel(parseInt(e.target.value))} value={playerLevel} fullWidth select>
                            <MenuItem key={0} value={0}>誰でも</MenuItem>
                            <MenuItem key={1} value={1}>普通</MenuItem>
                            <MenuItem key={2} value={2}>上級</MenuItem>
                            <MenuItem key={3} value={3}>プロレベル</MenuItem>
                        </TextField>
                        <Typography variant="h5" style={{ marginTop: 16 }}>
                            ゲームのカスタマイズ (オプション)
                        </Typography>
                        <TextField label="パスコード (プライベートにしたい場合)" variant="outlined" className={styles.formTextField} onChange={e => setPasscode(e.target.value)} value={passcode} fullWidth />
                        <TextField label="最大の人数" variant="outlined" className={styles.formTextField} onChange={e => setMaxPlayers(parseInt(e.target.value))} value={maxPlayers} fullWidth type="number" />
                        <TextField label="最小の人数" variant="outlined" className={styles.formTextField} onChange={e => setMinPlayers(parseInt(e.target.value))} value={minPlayers} fullWidth type="number" />
                        <TextField label="独自のルール" variant="outlined" className={styles.formTextField} onChange={e => setCustomRules(e.target.value)} value={customRules} fullWidth multiline minRows={4} />
                        <TextField label="独自の要件" variant="outlined" className={styles.formTextField} onChange={e => setRequirements(e.target.value)} value={requirements} fullWidth multiline minRows={4} />
                        {(editing) ? <>
                            <Typography style={{ marginTop: 32 }}>一度ゲームをキャンセルすると、取り消しはできません。</Typography>
                            <Button style={{ width: "100%", marginTop: 8, marginBottom: 32, backgroundColor: "red", color: "white" }} onClick={() => cancelGame(game_id!).then(() => onCancelled!())}>ゲームをキャンセルする</Button>
                        </> : null}
                    </DialogContent>
                </Dialog>
            )
        default:
            return (
                <Dialog open={show} onClose={() => onClose()} fullScreen>
                    <AppBar style={{ position: "relative" }}>
                        <Toolbar>
                            <IconButton edge="start" color="inherit" onClick={() => onClose()} aria-label="close">
                                <Close />
                            </IconButton>
                            <Typography variant="h6" style={{ flex: 1 }}>
                                {(editing) ? "Update game details" : "Organize a game"}
                            </Typography>
                            {(posting) ? <CircularProgress style={{ color: backgroundTheme }} /> : <Button style={{ backgroundColor: "red", color: "white" }} onClick={() => {
                                if (!title) {
                                    setErrorMsg("Title is required")
                                    return
                                }
                                if (!description) {
                                    setErrorMsg("Description is required")
                                    return
                                }
                                if (!location) {
                                    setErrorMsg("Location is required")
                                    return
                                }
                                if (new Date(formatDateToString(date) + "T" + time) < new Date()) {
                                    setErrorMsg("The datetime has already passed")
                                    return
                                }
                                setPosting(true)
                                if (editing) {
                                    updateGameDetail(game_id!, title, description, location, date, time, playerLevel, passcode, maxPlayers, minPlayers, customRules, requirements).then(() => {
                                        setTitle("")
                                        setDescription("")
                                        setLocation("")
                                        setPlayerLevel(0)
                                        setPasscode("")
                                        setMaxPlayers(22)
                                        setMinPlayers(1)
                                        setCustomRules("")
                                        setRequirements("")
                                        posted()
                                    }).catch(error => setErrorMsg(error.message)).finally(() => setPosting(false))
                                } else {
                                    organizeGame(uid, title, description, location, date, time, playerLevel, passcode, maxPlayers, minPlayers, customRules, requirements).then(() => {
                                        setTitle("")
                                        setDescription("")
                                        setLocation("")
                                        setPlayerLevel(0)
                                        setPasscode("")
                                        setMaxPlayers(22)
                                        setMinPlayers(1)
                                        setCustomRules("")
                                        setRequirements("")
                                        posted()
                                    }).catch(error => setErrorMsg(error.message)).finally(() => setPosting(false))
                                }
                            }}>{(editing) ? "Update" : "Post"}</Button>}
                        </Toolbar>
                    </AppBar>
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
                        {(editing) ? <>
                            <Typography style={{ marginTop: 32 }}>Once the game is cancelled, it can't be undone</Typography>
                            <Button style={{ width: "100%", marginTop: 8, marginBottom: 32, backgroundColor: "red", color: "white" }} onClick={() => cancelGame(game_id!).then(() => onCancelled!())}>Cancel game</Button>
                        </> : null}
                    </DialogContent>
                </Dialog>
            )
    }
}