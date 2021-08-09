import { StyleSheet, Dimensions } from 'react-native'

export const collection_columns = 2
export const screenWidth = Dimensions.get('window').width
export const screenHeight = Dimensions.get('window').height
export const cellSize = screenWidth / collection_columns

export const defaultBackground = "black"

export const defaultTheme = '#454545'

export const defaultTextColor = 'white'

export const listBackground = '#454545'

export const headerColor = 'black'

export const headerTint = 'white'

export const styles = StyleSheet.create({
    window: {
        flex: 1,
    },
    page: {
        flex: 1,
        alignItems: 'center',
        paddingLeft: 16,
        paddingRight: 16,
    },
    main_contents: {
        flex: 1,
        width: screenWidth,
    },
    list_container: {
        width: screenWidth,
        height: screenHeight,
        paddingLeft: 16,
        paddingRight: 16,
    },
    list_container_with_header: {
        width: screenWidth,
        height: screenHeight
    },
    list_header_style: {
        width: "100%",
    },
    collection_cell: {
        width: cellSize - 16,
        height: cellSize + 30,
        margin: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    collection_cell_image: {
        width: cellSize - 32,
        height: cellSize - 32,
        padding: 8
    },
    table_cell: {
        width: screenWidth - 32,
        borderTopColor: 'black',
        borderBottomColor: 'black',
        borderWidth: 1,
        marginTop: 8,
        borderRadius: 10
    },
    table_cell_margin: {
        width: screenWidth - 32,
        borderTopColor: 'black',
        borderBottomColor: 'black',
        borderWidth: 1,
        marginTop: 8,
        borderRadius: 10,
        marginLeft: 16,
        marginRight: 16
    },
    table_cell_view: {
        paddingTop: 8,
        paddingLeft: 16,
        paddingRight: 16,
        paddingBottom: 8,
    },
    category_cell: {
        width: screenWidth / 2,
        height: screenWidth / 2
    },
    profile_thumbnail_root: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profile_thumbnail_container: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
    },
    cover: {
        width: '100%',
        height: Dimensions.get('window').height * 0.3,
    },
    profile_image: {
        width: 48,
        height: 48
    },
    category_image: {
        width: screenWidth / 2,
        height: screenWidth / 2 - 50
    },
    image: {
        width: 48,
        height: 48
    },
    header_logo: {
        width: 50,
        height: 24
    },
    text_font: {
        fontSize: 20,
    },
    name_font: {
        fontSize: 30,
    },
    item_title: {
        fontSize: 20,
        overflow: 'hidden',
    },
    item_font: {
        fontSize: 20,
        marginTop: 4,
    },
    price_font: {
        fontSize: 20,
        marginTop: 4,
        fontWeight: "bold",
    },
    status_font_open: {
        color: 'green',
        fontSize: 20,
        marginTop: 4,
    },
    status_font_closed: {
        color: 'red',
        fontSize: 20,
        marginTop: 4
    },
    white_text: {
        color: 'white',
        fontSize: 15
    },
    inline_container: {
        flexDirection: 'row',
        maxHeight: 100
    },
    inline_container_with_margin: {
        flexDirection: 'row',
        marginTop: 8,
    },
    button_container: {
        marginTop: 16,
        marginBottom: 16,
    },
    input_style: {
        borderWidth: 1,
        borderRadius: 5,
        height: 40,
        backgroundColor: 'lightgrey'
    },
    multi_input_style: {
        borderWidth: 1,
        borderRadius: 5,
        height: 100,
        backgroundColor: 'lightgrey'
    },
    form_input: {
        borderColor: 'grey',
        borderWidth: 1,
        borderRadius: 5,
        padding: 4,
        fontSize: 22,
        marginStart: 16,
        marginEnd: 16,
        height: 50,
        marginTop: 16
    },
    message_input: {
        borderWidth: 1,
        flex: 2,
        fontSize: 20,
        height: 50,
        maxHeight: 100
    },
    image_button: {
        width: 48,
        height: 48,
        backgroundColor: 'skyblue'
    },
    add_button: {
        flexShrink: 1,
        width: 24,
        height: 24,
        justifyContent: 'flex-end'
    },
    round_button: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
        marginStart: 16,
        marginEnd: 16,
        marginTop: 16,
        fontSize: 20
    },
    signIn_button: {
        backgroundColor: 'skyblue',
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 24,
        marginStart: 16,
        marginEnd: 16,
        marginTop: 16
    },
    border: {
        borderWidth: 1,
        paddingTop: 8,
        paddingLeft: 16,
        paddingRight: 16,
        paddingBottom: 8,
    },
    border_round: {
        borderWidth: 1,
        paddingTop: 8,
        paddingLeft: 16,
        paddingRight: 16,
        paddingBottom: 8,
        borderRadius: 10
    },
    form: {
        width: screenWidth,
        paddingTop: 8,
        paddingLeft: 16,
        paddingRight: 16,
        paddingBottom: 8,
        marginTop: 16
    },
    picker_style: {
        height: 40
    },
    setting_column: {
        borderColor: 'grey',
        borderWidth: 1,
        padding: 16,
        backgroundColor: 'white',
        marginTop: 16
    },
    setting_column_font: {
        fontSize: 30,
    },
    drawer_column: {
        padding: 16,
        marginTop: 16,
        marginLeft: 16,
        marginRight: 16,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        borderColor: 'skyblue',
        borderWidth: 1,
        borderRadius: 20,
    },
    category_button: {
        width: 60,
        height: 60,
        margin: 16,
        borderRadius: 30,
        borderColor: 'skyblue',
        backgroundColor: 'skyblue',
        alignItems: 'center',
        justifyContent: 'center'
    },
    searchBar: {
        backgroundColor: 'lightgray',
        height: 50,
        width: screenWidth * 0.4,
        flexDirection: 'row',
        marginLeft: 100
    },
    navBar_button_right: {
        width: 24,
        height: 24,
        backgroundColor: 'skyblue',
        borderColor: 'skyblue',
        borderWidth: 1,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16
    },
    search_circle_button: {
        width: 24,
        height: 24,
        backgroundColor: 'skyblue',
        borderColor: 'skyblue',
        borderWidth: 1,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16
    },
    overlay: {
        flex: 1,
        position: 'absolute',
        left: 0,
        bottom: 0,
        opacity: 0.5,
        backgroundColor: 'black',
        width: screenWidth,
        height: '10%'
    }
})