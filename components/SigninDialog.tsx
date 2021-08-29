import { Dialog, DialogTitle, DialogContent, Button, TextField, Typography, DialogActions, IconButton } from "@material-ui/core"
import { Close } from "@material-ui/icons"
import { Alert } from "@material-ui/lab"
import React, { useState } from "react"
import { signInWithEmail, signInWithGoogle, signUp } from "../api/request/AuthRequest"
import { User } from "@supabase/supabase-js"
import Image from "next/image"

interface props {
    show: boolean
    region: string
    mode?: string
    signedIn: (user: User) => void
    onClose: () => void
}

export function SigninDialog({ show, region, mode = "Sign in", signedIn, onClose }: props) {
    const [authSuccessMsg, setAuthSuccessMsg] = useState("")
    const [authErrorMsg, setAuthErrorMsg] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPW, setConfirmPW] = useState("")
    const [signinMode, switchSigninMode] = useState(mode)

    function googleSignIn() {
        signInWithGoogle().then(user => {
            signedIn(user)
        }).catch(error => setAuthErrorMsg(error.message))
    }

    switch (region) {
        case "jp":
            if (signinMode == "Sign in") {
                return (
                    <Dialog open={show} onClose={() => onClose()}>
                        <DialogTitle style={{ backgroundColor: '#454545', color: 'white' }}>
                            サインイン
                        </DialogTitle>
                        <DialogContent style={{ backgroundColor: '#454545' }}>
                            {(authErrorMsg) ? <div style={{ alignItems: 'center', justifyContent: 'center', display: 'flex', margin: 16 }}><Alert severity="error">エラー: {authErrorMsg}</Alert></div> : null}
                            <div style={{ alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
                                <Button onClick={() => googleSignIn()}>
                                    <Image src={'/assets/images/google_signin.png'} width={250} height={60} alt={"Google Signin"} />
                                </Button>
                            </div>
                            <div style={{ marginTop: 32 }}>
                                <TextField onChange={e => setEmail(e.target.value)} label="メールアドレス" required variant="filled" style={{ backgroundColor: 'white' }} fullWidth />
                            </div>
                            <div style={{ marginTop: 8 }}>
                                <TextField onChange={e => setPassword(e.target.value)} type={'password'} label="パスワード" required variant="filled" style={{ backgroundColor: 'white' }} fullWidth />
                            </div>
                            <Typography align={"center"} style={{ margin: 16 }} paragraph>
                                <Button variant="contained" onClick={() => signInWithEmail(email, password).then(user => {
                                    signedIn(user)
                                }).catch(error => setAuthErrorMsg(error.message))} style={{ margin: 16, backgroundColor: 'white' }}>
                                    サインイン
                                </Button><br /><br />
                                <a href="forgot-password" style={{ color: 'aqua' }}>Forgot password</a>
                            </Typography>
                            <Typography align={"center"} style={{ color: 'white', marginTop: 16 }} >
                                まだアカウントをお持ちでない方はこちら<br />
                                <Button variant="contained" onClick={() => switchSigninMode("Sign up")} color="primary" style={{ margin: 16 }}>
                                    サインアップ
                                </Button>
                            </Typography>
                        </DialogContent>
                        <DialogActions style={{ backgroundColor: "#454545" }}>
                            <IconButton onClick={() => onClose()}>
                                <Close style={{ color: "red" }} />
                            </IconButton>
                            <div style={{ flexGrow: 1 }} />
                        </DialogActions>
                    </Dialog >
                )
            } else {
                return (
                    <Dialog open={show} onClose={() => onClose()}>
                        <DialogTitle style={{ backgroundColor: '#454545', color: 'white' }}>サインアップ</DialogTitle>
                        <DialogContent style={{ backgroundColor: '#454545' }}>
                            {(authSuccessMsg) ? <div style={{ alignItems: 'center', justifyContent: 'center', display: 'flex', margin: 16 }}><Alert severity="success">{authSuccessMsg}</Alert></div> : null}
                            {(authErrorMsg) ? <div style={{ alignItems: 'center', justifyContent: 'center', display: 'flex', margin: 16 }}><Alert severity="error">エラー: {authErrorMsg}</Alert></div> : null}
                            <div style={{ alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
                                <Button onClick={() => googleSignIn()}>
                                    <Image src={'/assets/images/google_signin.png'} width={250} height={60} alt={"Google Signin"} />
                                </Button>
                            </div>
                            <div style={{ marginTop: 32 }}>
                                <TextField onChange={e => setEmail(e.target.value)} label="メールアドレス" required variant="filled" style={{ backgroundColor: 'white' }} fullWidth />
                            </div>
                            <div style={{ marginTop: 8 }}>
                                <TextField onChange={e => setPassword(e.target.value)} type={'password'} label="パスワード" required variant="filled" style={{ backgroundColor: 'white' }} fullWidth />
                            </div>
                            <div style={{ marginTop: 8 }}>
                                <TextField onChange={e => setConfirmPW(e.target.value)} type={'password'} label="パスワード確認" required variant="filled" style={{ backgroundColor: 'white' }} fullWidth />
                            </div>
                            <Typography align={"center"} style={{ margin: 16 }} paragraph>
                                <Button variant="contained" onClick={() => {
                                    if (email == "") {
                                        setAuthErrorMsg("メールアドレスが正しくありません")
                                        return
                                    }
                                    if (password != confirmPW) {
                                        setAuthErrorMsg("パスワードが一致しません")
                                        return
                                    }
                                    if (password.length < 8) {
                                        setAuthErrorMsg("パスワードは8文字以上である必要があります")
                                        return
                                    }
                                    signUp(email, password).then(user => {
                                        if (user.id) {
                                            setAuthSuccessMsg("アカウントが作成されました。メールアドレスを確認してアクティベーションを完了させてください。")
                                        }
                                    }).catch(error => setAuthErrorMsg(error.message))
                                }} style={{ margin: 16, backgroundColor: 'white' }}>
                                    サインアップ
                                </Button>
                            </Typography>
                            <Typography align={"center"} style={{ color: 'white', marginTop: 16 }} >
                                既にアカウントをお持ちの方はこちら<br />
                                <Button variant="contained" onClick={() => switchSigninMode("Sign in")} color="primary" style={{ margin: 16 }}>
                                    サインイン
                                </Button>
                            </Typography>
                        </DialogContent>
                        <DialogActions style={{ backgroundColor: "#454545" }}>
                            <IconButton onClick={() => onClose()}>
                                <Close style={{ color: "red" }} />
                            </IconButton>
                            <div style={{ flexGrow: 1 }} />
                        </DialogActions>
                    </Dialog>
                )
            }
        default:
            if (signinMode == "Sign in") {
                return (
                    <Dialog open={show} onClose={() => onClose()}>
                        <DialogTitle style={{ backgroundColor: '#454545', color: 'white' }}>
                            Sign in
                        </DialogTitle>
                        <DialogContent style={{ backgroundColor: '#454545' }}>
                            {(authErrorMsg) ? <div style={{ alignItems: 'center', justifyContent: 'center', display: 'flex', margin: 16 }}><Alert severity="error">Error: {authErrorMsg}</Alert></div> : null}
                            <div style={{ alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
                                <Button onClick={() => googleSignIn()}>
                                    <Image src={'/assets/images/google_signin.png'} width={250} height={60} alt={"Google Signin"} />
                                </Button>
                            </div>
                            <div style={{ marginTop: 32 }}>
                                <TextField onChange={e => setEmail(e.target.value)} label="Email" required variant="filled" style={{ backgroundColor: 'white' }} fullWidth />
                            </div>
                            <div style={{ marginTop: 8 }}>
                                <TextField onChange={e => setPassword(e.target.value)} type={'password'} label="Password" required variant="filled" style={{ backgroundColor: 'white' }} fullWidth />
                            </div>
                            <Typography align={"center"} style={{ margin: 16 }} paragraph>
                                <Button variant="contained" onClick={() => signInWithEmail(email, password).then(user => {
                                    signedIn(user)
                                }).catch(error => setAuthErrorMsg(error.message))} style={{ margin: 16, backgroundColor: 'white' }}>
                                    Sign in
                                </Button><br /><br />
                                <a href="forgot-password" style={{ color: 'aqua' }}>Forgot password</a>
                            </Typography>
                            <Typography align={"center"} style={{ color: 'white', marginTop: 16 }} >
                                You can create an account if you don&apos;t have one<br />
                                <Button variant="contained" onClick={() => switchSigninMode("Sign up")} color="primary" style={{ margin: 16 }}>
                                    Sign up
                                </Button>
                            </Typography>
                        </DialogContent>
                        <DialogActions style={{ backgroundColor: "#454545" }}>
                            <IconButton onClick={() => onClose()}>
                                <Close style={{ color: "red" }} />
                            </IconButton>
                            <div style={{ flexGrow: 1 }} />
                        </DialogActions>
                    </Dialog >
                )
            } else {
                return (
                    <Dialog open={show} onClose={() => onClose()}>
                        <DialogTitle style={{ backgroundColor: '#454545', color: 'white' }}>Sign up</DialogTitle>
                        <DialogContent style={{ backgroundColor: '#454545' }}>
                            {(authSuccessMsg) ? <div style={{ alignItems: 'center', justifyContent: 'center', display: 'flex', margin: 16 }}><Alert severity="success">{authSuccessMsg}</Alert></div> : null}
                            {(authErrorMsg) ? <div style={{ alignItems: 'center', justifyContent: 'center', display: 'flex', margin: 16 }}><Alert severity="error">Error: {authErrorMsg}</Alert></div> : null}
                            <div style={{ alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
                                <Button onClick={() => googleSignIn()}>
                                    <Image src={'/assets/images/google_signin.png'} width={250} height={60} alt={"Google Signin"} />
                                </Button>
                            </div>
                            <div style={{ marginTop: 32 }}>
                                <TextField onChange={e => setEmail(e.target.value)} label="Email" required variant="filled" style={{ backgroundColor: 'white' }} fullWidth />
                            </div>
                            <div style={{ marginTop: 8 }}>
                                <TextField onChange={e => setPassword(e.target.value)} type={'password'} label="Password" required variant="filled" style={{ backgroundColor: 'white' }} fullWidth />
                            </div>
                            <div style={{ marginTop: 8 }}>
                                <TextField onChange={e => setConfirmPW(e.target.value)} type={'password'} label="Confirm" required variant="filled" style={{ backgroundColor: 'white' }} fullWidth />
                            </div>
                            <Typography align={"center"} style={{ margin: 16 }} paragraph>
                                <Button variant="contained" onClick={() => {
                                    if (email == "") {
                                        setAuthErrorMsg("Email is not filled")
                                        return
                                    }
                                    if (password != confirmPW) {
                                        setAuthErrorMsg("Password doesn't match")
                                        return
                                    }
                                    if (password.length < 8) {
                                        setAuthErrorMsg("Password length must be more than 8 characters")
                                        return
                                    }
                                    signUp(email, password).then(user => {
                                        if (user.id) {
                                            setAuthSuccessMsg("Sign up success. Please confirm your enail first")
                                        }
                                    }).catch(error => setAuthErrorMsg(error.message))
                                }} style={{ margin: 16, backgroundColor: 'white' }}>
                                    Sign up
                                </Button>
                            </Typography>
                            <Typography align={"center"} style={{ color: 'white', marginTop: 16 }} >
                                You can sign in if you already have an account<br />
                                <Button variant="contained" onClick={() => switchSigninMode("Sign in")} color="primary" style={{ margin: 16 }}>
                                    Sign in
                                </Button>
                            </Typography>
                        </DialogContent>
                        <DialogActions style={{ backgroundColor: "#454545" }}>
                            <IconButton onClick={() => onClose()}>
                                <Close style={{ color: "red" }} />
                            </IconButton>
                            <div style={{ flexGrow: 1 }} />
                        </DialogActions>
                    </Dialog>
                )
            }
    }
}