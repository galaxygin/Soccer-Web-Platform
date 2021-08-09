import { Typography } from '@material-ui/core'
import Image from 'next/image'
import { useStyles } from '../public/assets/styles/styles.web'
import PageBase from './PageBase'

export default function Home() {
  const styles = useStyles()

  function content() {
    return (
      <div>
        <Typography variant="h5" style={{ color: 'white' }}>
          Home
        </Typography>
        Home
      </div>
    )
  }

  return <PageBase content={content()} />
}
