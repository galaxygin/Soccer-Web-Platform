import { CircularProgress } from '@material-ui/core'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'

export default function HomeView() {
  const router = useRouter()

  useEffect(() => {
    fetch('https://extreme-ip-lookup.com/json/')
      .then(res => res.json())
      .then(response => {
        switch (response.country) {
          case "Australia":
            router.push("/au")
            break
          case "Japam":
            router.push("/jp")
            break
          default:
            router.push("/au")
        }
      })
      .catch(data => {
        router.push("/au")
        console.log("Couldn't check country:", data);
      });
  }, [])

  return <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
    Checking Region<br />
    <CircularProgress />
  </div>
}
