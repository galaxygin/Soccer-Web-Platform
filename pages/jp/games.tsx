import DateFnsUtils from '@date-io/date-fns'
import { Fab, Typography, Snackbar, CircularProgress, TextField, MenuItem, IconButton } from '@material-ui/core'
import { AddTwoTone, ChevronLeft, Close } from '@material-ui/icons'
import Alert from '@material-ui/lab/Alert'
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers'
import { User } from '@supabase/supabase-js'
import React, { useState, useEffect, useCallback } from 'react'
import { isMobile } from 'react-device-detect'
import { getTodaysGames, getGamesOfTheWeek, searchGames } from '../../api/request/GameTestRequest'
import { GameCollection, GameCollectionNoWrap } from '../../components/GameList'
import OrganizeForm from '../../components/OrganizeForm'
import { PageBaseFunction } from '../../components/PageBase'
import { GameHeader } from '../../Definitions'
import { backgroundTheme, darkerTextColor, useStyles } from '../../public/assets/styles/styles.web'

export default function GamesView() {
    const styles = useStyles()
    const [user, setUser] = useState<User | null>()

    const [searchText, setSearchText] = useState("")
    const [location, setLocation] = useState<string>()
    const [level, setLevel] = useState(0)
    const [date, setDate] = useState<Date>(new Date())
    const [time, setTime] = useState<string>()
    const [searchResult, setSearchResult] = useState<GameHeader[]>([])
    const [searching, setSearching] = useState(false)
    const [openingSearch, setOpeningSearch] = useState(false)

    const [loadingTodaysGames, setLoadingTodaysGames] = useState(true)
    const [todaysGames, setTodaysGames] = useState<GameHeader[]>([])
    const [loadingGamesOfTheWeek, setLoadingGamesOfTheWeek] = useState(true)
    const [gamesOfTheWeek, setGamesOfTheWeek] = useState<GameHeader[]>([])

    const [postDialog, openPostDialog] = useState(false)
    const [showSnackbar, openSnackbar] = useState(false)

    useEffect(() => {
        if (searchText)
            fetchSearchGames()
    }, [searchText])

    useEffect(() => {
        if (location)
            fetchSearchGames()
    }, [location])

    useEffect(() => {
        fetchSearchGames()
    }, [level])

    useEffect(() => {
        fetchSearchGames()
    }, [date])

    useEffect(() => {
        fetchSearchGames()
    }, [time])

    function fetchTodaysGames() {
        setLoadingTodaysGames(true)
        getTodaysGames().then(games => setTodaysGames(games)).catch(error => console.log(error.message)).finally(() => setLoadingTodaysGames(false))
    }

    function fetchWeekGames() {
        setLoadingGamesOfTheWeek(true)
        getGamesOfTheWeek().then(games => setGamesOfTheWeek(games)).catch(error => console.log(error.message)).finally(() => setLoadingGamesOfTheWeek(false))
    }

    function fetchSearchGames() {
        if (searching)
            return
        setSearching(true)
        searchGames(searchText, level, date, location, time).then(games => setSearchResult(games)).catch(error => { console.log(error.message) }).finally(() => setSearching(false))
    }

    function renderTodaysGame() {
        if (todaysGames.length > 0)
            return <GameCollectionNoWrap games={todaysGames} region={"jp"} />
        else
            return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300, color: darkerTextColor }}>
                ゲームの取得に失敗したか、今日予定されてるゲームはありません。
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

    function renderSearchResult() {
        if (searchResult.length > 0)
            return <div>
                {renderFilters()}
                <GameCollection games={searchResult} region={"jp"} />
            </div>
        else
            return <div>
                {renderFilters()}
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300, color: darkerTextColor }}>
                    条件に合うゲームは見つかりませんでした
                </div>
            </div>
    }

    function renderFilters() {
        return <div style={{ display: "flex", flexDirection: "row", alignItems: "center", marginLeft: 8, marginRight: 8, flexWrap: "wrap", borderColor: "silver", borderWidth: 1, borderStyle: "solid", borderRadius: 15, padding: 8 }}>
            <IconButton onClick={() => {
                setSearching(true)
                setLocation("")
                setLevel(0)
                setDate(new Date())
                setTime("")
                searchGames(searchText, 0, new Date(), "", "").then(games => setSearchResult(games)).catch(error => { console.log(error.message) }).finally(() => setSearching(false))
            }}>
                <Close />
            </IconButton>
            <TextField label="場所" variant="outlined" onChange={e => setLocation(e.target.value)} value={location} />
            <TextField label="レベル" variant="outlined" onChange={e => setLevel(parseInt(e.target.value))} value={level} select style={{ marginLeft: 8 }}>
                <MenuItem key={0} value={0}>誰でも</MenuItem>
                <MenuItem key={1} value={1}>普通</MenuItem>
                <MenuItem key={2} value={2}>上級</MenuItem>
                <MenuItem key={3} value={3}>プロレベル</MenuItem>
            </TextField>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDatePicker
                    disableToolbar
                    variant="inline"
                    format="yyyy-MM-dd"
                    margin="none"
                    id="date-picker-inline"
                    label="この日から"
                    value={date}
                    onChange={(date: Date | null) => setDate(date!)}
                    KeyboardButtonProps={{
                        'aria-label': 'change date',
                    }}
                    style={{ width: 140, marginLeft: 8 }}
                />
            </MuiPickersUtilsProvider>
            <TextField label="この時間から" variant="outlined" onChange={e => setTime(e.target.value)} defaultValue={time} type="time" style={{ width: 100, marginLeft: 8 }} />
        </div>
    }

    function content() {
        return (
            <div style={{ paddingTop: 16 }}>
                {(user) ? <OrganizeForm show={postDialog} uid={user.id} posted={() => {
                    openPostDialog(false)
                    openSnackbar(true)
                    fetchTodaysGames()
                    fetchWeekGames()
                }} onClose={() => openPostDialog(false)} /> : null}
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", flexWrap: "nowrap" }}>
                    {(openingSearch) ? <IconButton style={{ marginLeft: 16 }} onClick={() => {
                        setOpeningSearch(false)
                        setSearchText("")
                    }}><ChevronLeft /></IconButton> : null}
                    <TextField label="Search games..." variant="outlined" className={styles.formTextField} onChange={e => {
                        setSearchText(e.target.value)
                        setOpeningSearch(true)
                    }} value={searchText} style={{ margin: 32, marginLeft: (openingSearch) ? 16 : 32 }} fullWidth />
                </div>
                {(openingSearch) ? renderSearchResult() : <>
                    <Typography component={"div"} variant="h4" style={{ color: darkerTextColor, fontWeight: "bold", fontFamily: "norwester", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        今日のゲーム
                    </Typography>
                    {(loadingTodaysGames) ? <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}><CircularProgress style={{ color: backgroundTheme }} /></div> : renderTodaysGame()}
                    <Typography component={"div"} variant="h4" style={{ color: darkerTextColor, fontWeight: "bold", fontFamily: "norwester", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        今週のゲーム
                    </Typography>
                    {(loadingGamesOfTheWeek) ? <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}><CircularProgress style={{ color: backgroundTheme }} /></div> : renderGamesOfTheWeek()}
                    <Snackbar open={showSnackbar} autoHideDuration={6000} onClose={() => openSnackbar(false)}>
                        <Alert onClose={() => openSnackbar(false)} severity="success">ゲームの企画に成功しました。</Alert>
                    </Snackbar>
                    {(user) ?
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
                        </Fab> : null}
                </>}
            </div >
        )
    }

    return <PageBaseFunction content={content()} region={"jp"} onStateChanged={user => {
        setUser(user)
        fetchTodaysGames()
        fetchWeekGames()
    }} />
}