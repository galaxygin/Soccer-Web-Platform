import { createTheme } from '@material-ui/core/styles';
import { red } from '@material-ui/core/colors';
import { backgroundTheme, defaultTheme } from './styles.web';

// Create a theme instance.
const theme = createTheme({
    palette: {
        primary: {
            main: defaultTheme,
        },
        secondary: {
            main: '#4d4546',
        },
        error: {
            main: red.A400,
        },
        background: {
            default: backgroundTheme,
        },
    },
});

export default theme;