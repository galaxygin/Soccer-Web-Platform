import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router'
import { Link, MenuItem, IconButton, Menu, AppBar, Toolbar, Typography, BottomNavigation, BottomNavigationAction, Button, Dialog, Container } from '@material-ui/core';
import { AccountCircle, Home, Search, SportsSoccerTwoTone } from '@material-ui/icons';
import Header from './Header';
import { defaultTheme, drawerStyles, useStyles } from '../public/assets/styles/styles.web';
import { appName } from '../Definitions';
import { isMobile } from 'react-device-detect'
import { getUser, signOut } from '../api/request/AuthRequest';
import SignIn from './signin';

interface props {
    content: JSX.Element,
    header?: JSX.Element
}
export default function PageBase({ content, header = <Header /> }: props) {
    const styles = useStyles()
    const drawerStyle = drawerStyles()
    const router = useRouter()
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [thumbnail_url, setThumbnailUrl] = useState('')
    const [width, setWidth] = useState(0)
    const [height, setHeight] = useState(0)
    const [dialog, openDialog] = useState(false)
    const [signinMode, setSigninMode] = useState("Sign in")

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const isMenuOpen = Boolean(anchorEl);

    useEffect(() => {
        // getProfile().then(doc => {
        //     setThumbnailUrl(doc.data()?.thumbnail_url)
        // })
        setWidth(window.innerWidth)
        setHeight(window.innerHeight)
    }, [])

    const menuId = 'primary-search-account-menu';
    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    function accountMenu() {
        if (getUser()) {
            return (
                <Menu
                    anchorEl={anchorEl}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    id={menuId}
                    keepMounted
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    open={isMenuOpen}
                    onClose={handleMenuClose}
                >
                    <MenuItem onClick={() => {
                        handleMenuClose()
                        router.push('account')
                    }}>Account <AccountCircle style={{ marginLeft: 8 }} /></MenuItem>
                </Menu>
            )
        } else {
            return (
                <Menu
                    anchorEl={anchorEl}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    id={menuId}
                    keepMounted
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    open={isMenuOpen}
                    onClose={handleMenuClose}
                >
                    <MenuItem onClick={() => {
                        handleMenuClose()
                        setSigninMode("Sign in")
                        openDialog(true)
                    }}>Sign in</MenuItem>
                    <MenuItem onClick={() => {
                        handleMenuClose()
                        setSigninMode("Sign up")
                        openDialog(true)
                    }}>Sign up</MenuItem>
                </Menu>
            )
        }
    }

    if (isMobile) {
        return (
            <div className={styles.root} style={{ flexDirection: 'column' }}>
                <AppBar position="fixed" >
                    <Toolbar>
                        <Link href="/" color="inherit">
                            <Typography variant="h6" style={{ color: 'white' }} noWrap>{appName}</Typography>
                        </Link>
                        <div className={styles.grow} />
                        <IconButton
                            edge="end"
                            aria-label="account of current user"
                            aria-controls={menuId}
                            aria-haspopup="true"
                            onClick={e => setAnchorEl(e.currentTarget)}
                            color="inherit"
                        >
                            {(thumbnail_url) ? <img src={thumbnail_url} width={36} height={36} style={{ borderRadius: 18 }} /> : <AccountCircle style={{ width: 36, height: 36, borderRadius: 12 }} />}
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <Container fixed style={{ flex: 2 }}>
                    <div style={{ flex: 2 }} >
                        <div className={styles.drawerHeader} />
                        <Dialog open={dialog} onClose={() => openDialog(false)}>
                            <SignIn mode={signinMode} />
                        </Dialog>
                        {content}
                    </div>
                </Container>
                <BottomNavigation
                    value={selectedIndex}
                    onChange={(e, index) => {
                        setSelectedIndex(index)
                        console.log(e.target)
                        console.log(index)
                    }}
                    showLabels
                    style={{ backgroundColor: 'white', width: "100%", flex: 1 }}
                >
                    <BottomNavigationAction label="Home" icon={<Home />} />
                    <BottomNavigationAction label="Search" icon={<Search />} />
                    <BottomNavigationAction label="Games" icon={<SportsSoccerTwoTone />} />
                </BottomNavigation>
                {accountMenu()}
            </div>
        )
    } else {
        return (
            <div className={styles.root}>
                <AppBar position="fixed" className={drawerStyle.appBar}>
                    <Toolbar>
                        <Link href="/" color="inherit">
                            <Typography variant="h6" style={{ color: 'white' }} noWrap>{appName}</Typography>
                        </Link>
                        <div className={styles.grow} />
                        <IconButton
                            edge="end"
                            aria-label="account of current user"
                            aria-controls={menuId}
                            aria-haspopup="true"
                            onClick={e => setAnchorEl(e.currentTarget)}
                            color="inherit"
                        >
                            {(thumbnail_url) ? <img src={thumbnail_url} width={36} height={36} style={{ borderRadius: 18 }} /> : <AccountCircle style={{ width: 36, height: 36, borderRadius: 12 }} />}
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <main style={{ width: width, display: 'flex', flexDirection: 'column' }}>
                    <div className={styles.drawerHeader} />
                    <Dialog open={dialog} onClose={() => openDialog(false)}>
                        <SignIn mode={signinMode} />
                    </Dialog>
                    <div style={{ display: "flex" }}>
                        <div style={{ width: "25%", justifyContent: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
                            <Typography style={{ backgroundColor: defaultTheme, width: "90%", height: 50, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 25, marginTop: 16 }} variant="h5" onClick={() => console.log("Works")}>
                                Home <Home style={{ marginLeft: 8, width: 40, height: 30 }} />
                            </Typography>
                            <Typography style={{ backgroundColor: defaultTheme, width: "90%", height: 50, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 25, marginTop: 16 }} variant="h5" onClick={() => console.log("Works")}>
                                Search <Search style={{ marginLeft: 8, width: 40, height: 30 }} />
                            </Typography>
                            <Typography style={{ backgroundColor: defaultTheme, width: "90%", height: 50, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 25, marginTop: 16 }} variant="h5" onClick={() => console.log("Works")}>
                                Games <SportsSoccerTwoTone style={{ marginLeft: 8, width: 40, height: 30 }} />
                            </Typography>
                        </div>
                        <div style={{ width: "50%", justifyContent: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column', backgroundColor: 'green' }}>
                            {content}
                            <BottomNavigation
                                value={selectedIndex}
                                onChange={(e, index) => {
                                    setSelectedIndex(index)
                                    console.log(e.target)
                                    console.log(index)
                                }}
                                showLabels
                                style={{ backgroundColor: 'white' }}
                            >
                                <BottomNavigationAction label="Home" icon={<Home />} value={"Home"} />
                                <BottomNavigationAction label="Search" icon={<Search />} value={"Search"} />
                                <BottomNavigationAction label="Games" icon={<SportsSoccerTwoTone />} value={"Games"} />
                            </BottomNavigation>
                        </div>
                        <div style={{ width: "25%", justifyContent: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
                            <Button style={{ backgroundColor: 'skyblue', width: "90%" }}>Home</Button>
                        </div>
                    </div>
                </main>
                {accountMenu()}
            </div>
        )
    }
}