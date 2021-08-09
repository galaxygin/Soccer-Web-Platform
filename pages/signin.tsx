import React, { useEffect, useState } from 'react'
import { Typography, Button, TextField, DialogContent, DialogTitle } from '@material-ui/core'
import Alert from '@material-ui/lab/Alert'
import { addUserToDB, signInWithEmail, signInWithGoogle, signUp } from '../api/request/AuthRequest'

export default function SignIn({ mode = "Sign in" }) {
    const [errorMsg, setMsg] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirm, setConfirm] = useState("")
    const [myWindow, setWindow] = useState(undefined)
    const [smode, switchMode] = useState(mode)

    useEffect(() => setWindow(window), [])

    function googleSignIn() {
        signInWithGoogle().then(user => {
            addUserToDB(user.id).catch(error => { })
        }).catch(error => {
            setMsg(error.message)
        })
    }

    if (smode == "Sign in") {
        return (
            <>
                <DialogTitle style={{ backgroundColor: '#454545', color: 'white' }}>Sign in</DialogTitle>
                <DialogContent style={{ backgroundColor: '#454545' }}>
                    <div style={{ alignItems: 'center', justifyContent: 'center', display: 'flex', margin: 16 }}>
                        {(errorMsg) ? <Alert severity="error">Error: {errorMsg}</Alert> : null}
                    </div>
                    <div style={{ alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
                        <Button onClick={() => googleSignIn()}>
                            <img src={'./assets/images/google_signin.png'} height={60} alt={"Google Signin"} />
                        </Button>
                    </div>
                    <div style={{ marginTop: 32 }}>
                        <TextField onChange={e => setEmail(e.target.value)} label="Email" required variant="filled" style={{ backgroundColor: 'white' }} fullWidth />
                    </div>
                    <div style={{ marginTop: 8 }}>
                        <TextField onChange={e => setPassword(e.target.value)} type={'password'} label="Password" required variant="filled" style={{ backgroundColor: 'white' }} fullWidth />
                    </div>
                    <Typography align={"center"} style={{ margin: 16 }} paragraph>
                        <Button variant="contained" onClick={() => signInWithEmail(email, password).then(result => {
                            myWindow.location.reload(true)
                        }).catch(error => {
                            setMsg(error.message)
                        })} style={{ margin: 16, backgroundColor: 'white' }}>
                            Sign in
                        </Button><br /><br />
                        <a href="forgot-password" style={{ color: 'aqua' }}>Forgot password</a>
                    </Typography>
                    <Typography align={"center"} style={{ color: 'white', marginTop: 16 }} >
                        You can create an account if you don't have one<br />
                        <Button variant="contained" onClick={() => switchMode("Sign up")} color="primary" style={{ margin: 16 }}>
                            Sign up
                        </Button>
                    </Typography>
                </DialogContent>
            </>
        )
    } else {
        return (
            <>
                <DialogTitle style={{ backgroundColor: '#454545', color: 'white' }}>Sign up</DialogTitle>
                <DialogContent style={{ backgroundColor: '#454545' }}>
                    <div style={{ alignItems: 'center', justifyContent: 'center', display: 'flex', margin: 16 }}>
                        {(errorMsg) ? <Alert severity="error">Error: {errorMsg}</Alert> : null}
                    </div>
                    <div style={{ alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
                        <Button onClick={() => googleSignIn()}>
                            <img src={'./assets/images/google_signin.png'} height={60} alt={"Google Signin"} />
                        </Button>
                    </div>
                    <div style={{ marginTop: 32 }}>
                        <TextField onChange={e => setEmail(e.target.value)} label="Email" required variant="filled" style={{ backgroundColor: 'white' }} fullWidth />
                    </div>
                    <div style={{ marginTop: 8 }}>
                        <TextField onChange={e => setPassword(e.target.value)} type={'password'} label="Password" required variant="filled" style={{ backgroundColor: 'white' }} fullWidth />
                    </div>
                    <div style={{ marginTop: 8 }}>
                        <TextField onChange={e => setConfirm(e.target.value)} type={'password'} label="Confirm" required variant="filled" style={{ backgroundColor: 'white' }} fullWidth />
                    </div>
                    <Typography align={"center"} style={{ margin: 16 }} paragraph>
                        <Button variant="contained" onClick={() => {
                            if (email == "") {
                                setMsg("Email is not filled")
                                return
                            }
                            if (password != confirm) {
                                setMsg("Password doesn't match")
                                return
                            }
                            signUp(email, password).then(result => {
                                if (result.id)
                                    addUserToDB(result.id).then(result => {
                                        myWindow.location.reload(true)
                                    })
                            }).catch(error => {
                                setMsg(error.message)
                            })
                        }} style={{ margin: 16, backgroundColor: 'white' }}>
                            Sign up
                        </Button>
                    </Typography>
                    <Typography align={"center"} style={{ color: 'white', marginTop: 16 }} >
                        You can sign in if you already have an account<br />
                        <Button variant="contained" onClick={() => switchMode("Sign in")} color="primary" style={{ margin: 16 }}>
                            Sign in
                        </Button>
                    </Typography>
                </DialogContent>
            </>
        )
    }
}