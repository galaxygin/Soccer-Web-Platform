import Head from 'next/head'
import { appName } from '../Definitions'

export default function Header({ title = "Soccer", description = "A platform for soccer players to look and organise a game", url = "", thumbnail_url = "" }) {
    return <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta name="theme-color" content="#118b92" />

        <title>{title}</title>
        <meta name="description" content={description} />

        <meta property="og:site_name" content={appName} />
        <meta property="og:title" content={title} />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={thumbnail_url} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content={"video.movie"} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:image" content={thumbnail_url} />
    </Head>
}