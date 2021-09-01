import { makeStyles, alpha, createStyles, Theme } from "@material-ui/core";

export const drawerWidth = 240;

export const defaultTheme = "white"

export const backgroundTheme = '#2d7719'

export const primaryTextColor = "white"

export const darkerTextColor = "#272c58"

export const brighterBlueTextColor = "#6a9cd4"

export const themeColor = backgroundTheme

export const borderColor = backgroundTheme

export const defaultTextColor = brighterBlueTextColor

export const goldColor = "#f8b00d"

export const headerTint = 'white'

const styles = (theme: Theme) => createStyles({
    root: {
        display: 'flex',
        backgroundColor: backgroundTheme
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
    },
    drawerAppBar: {
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        backgroundColor: backgroundTheme,
    },
    appBarShift: {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: drawerWidth,
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    menuButton: {
        marginRight: theme.spacing(2),
        [theme.breakpoints.up('sm')]: {
            display: 'none',
        },
    },
    hide: {
        display: 'none',
    },
    drawer: {
        [theme.breakpoints.up('sm')]: {
            width: drawerWidth,
            flexShrink: 0,
        },
    },
    drawerPaper: {
        width: drawerWidth,
        backgroundColor: backgroundTheme
    },
    drawerContainer: {
        backgroundColor: '#454545'
    },
    drawerHeader: {
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(0, 1),
        // necessary for content to be below app bar
        ...theme.mixins.toolbar,
        justifyContent: 'flex-end',
    },
    content: {
        flexGrow: 1,
        // padding: theme.spacing(3),
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        marginLeft: -drawerWidth,
        width: "100%"
    },
    contentShift: {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0,
        height: "100vh" + theme.mixins.toolbar,
    },
    textColor: {
        color: 'white'
    },
    control: {
        padding: theme.spacing(2),
    },
    grow: {
        flexGrow: 1,
    },
    searchMobile: {
        display: 'flex',
        [theme.breakpoints.up('md')]: {
            display: 'none',
        },
        marginLeft: 16,
        marginRight: 16
    },
    searchDesktop: {
        display: 'none',
        [theme.breakpoints.up('md')]: {
            display: 'flex',
            position: 'relative',
            borderRadius: theme.shape.borderRadius,
            backgroundColor: alpha(theme.palette.common.white, 0.15),
            '&:hover': {
                backgroundColor: alpha(theme.palette.common.white, 0.25),
            },
            marginRight: theme.spacing(2),
            marginLeft: 16,
            width: '100%',
            [theme.breakpoints.up('sm')]: {
                // marginLeft: theme.spacing(3),
                width: 'auto',
            },
            justifyContent: 'center',
            alignItems: 'center',
        },
        marginLeft: 16,
        marginRight: 16
    },
    searchIcon: {
        padding: theme.spacing(0, 2),
        height: '100%',
        position: 'absolute',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchSpacer: {
        [theme.breakpoints.up('md')]: {
            flexGrow: 1,
        },
    },
    inputRoot: {
        color: 'inherit',
    },
    inputInput: {
        paddingLeft: 16,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: '60ch',
        },
    },
    sectionDesktop: {
        display: 'none',
        [theme.breakpoints.up('md')]: {
            display: 'flex',
        },
    },
    sectionMobile: {
        display: 'flex',
        [theme.breakpoints.up('md')]: {
            display: 'none',
        },
    },
    formTextField: {
        backgroundColor: "white",
        color: darkerTextColor,
        marginTop: 16
    },
    thumbnailCircle100: {
        borderRadius: 100
    },
    thumbnailCircle48: {
        borderRadius: 24
    },
    thumbnailCircle36: {
        borderRadius: 18
    },
    thumbnailCircle30: {
        borderRadius: 15
    }
});

export const useStyles = makeStyles(styles);

export const classStyles = styles