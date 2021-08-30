import { Typography, CircularProgress, Button } from "@material-ui/core"
import { AccountCircle } from "@material-ui/icons"
import { Alert } from "@material-ui/lab"
import Image from "next/image"
import React, { useState } from "react"
import { landscapeFieldImgURI } from "../Definitions"
import { updateHeader, updateThumbnail } from "./UserDataManager"

interface Props {
    uid: string
    region: string
    imagePreviewWidth?: number
    imagePreviewHeight?: number
    onSuccess?: (url: string) => void
}

function pickImage(event: React.ChangeEvent<HTMLInputElement>): File | null {
    if (event.target.files && event.target.files[0]) {
        // const fileReader: FileReader = new myWindow.FileReader()
        // fileReader.onload = async (e: Event) => { }
        // fileReader.readAsArrayBuffer(event.target.files[0]);
        return event.target.files[0]
    }
    return null
}

export function ThumbnailUploader({ uid, region = "au", imagePreviewWidth = 100, imagePreviewHeight = 100, onSuccess }: Props): JSX.Element {
    const [thumbnail_url, setThumbnailUrl] = useState<string | undefined>("")
    const [newThumb, setNewThumb] = useState<File | null>()
    const [thumbLoading, setThumbLoading] = useState(false)
    const [errorThumbMsg, setErrorThumbMsg] = useState(null)

    function renderPreview() {
        if (thumbnail_url) {
            return <Image src={thumbnail_url} width={imagePreviewWidth} height={imagePreviewHeight} alt={"user thumbnail"} />
        } else {
            return <AccountCircle style={{ width: imagePreviewWidth, height: imagePreviewHeight }} />
        }
    }

    function upload() {
        setThumbLoading(true)
        updateThumbnail(uid, newThumb!).then(url => {
            setThumbnailUrl(url)
            if (onSuccess)
                onSuccess(url)
        }).catch(error => {
            setErrorThumbMsg(error.message)
        }).finally(() => setThumbLoading(false))
    }

    switch (region) {
        case "jp":
            return <div>
                <Typography variant="h6">サムネイル</Typography>
                {(errorThumbMsg) ? <Alert severity="error" style={{ marginBottom: 8 }}>{errorThumbMsg}</Alert> : null}
                {renderPreview()}
                <input type="file" onChange={e => setNewThumb(pickImage(e))} className="filetype" accept="image/*" id="group_image" /><br />{
                    (thumbLoading) ? <CircularProgress style={{ color: 'white' }} /> : <Button disabled={!newThumb} variant="outlined" onClick={() => {
                        upload()
                    }} color="primary" style={{ backgroundColor: 'red', color: "white" }}>
                        アップロード
                    </Button>
                }
            </div>
        default:
            return <div>
                <Typography variant="h6">Thumbnail</Typography>
                {(errorThumbMsg) ? <Alert severity="error" style={{ marginBottom: 8 }}>{errorThumbMsg}</Alert> : null}
                {renderPreview()}
                <input type="file" onChange={e => setNewThumb(pickImage(e))} className="filetype" accept="image/*" id="group_image" /><br />{
                    (thumbLoading) ? <CircularProgress style={{ color: 'white' }} /> : <Button disabled={!newThumb} variant="outlined" onClick={() => {
                        upload()
                    }} color="primary" style={{ backgroundColor: 'red', color: "white" }}>
                        Upload
                    </Button>
                }
            </div>
    }
}

export function HeaderUploader({ uid, region = "au", imagePreviewWidth = 500, imagePreviewHeight = 300, onSuccess }: Props): JSX.Element {
    const [header_url, setHeaderUrl] = useState<string>("")
    const [newHeader, setNewHeader] = useState<File | null>()
    const [headerLoading, setHeaderLoading] = useState(false)
    const [errorHeaderMsg, setErrorHeaderMsg] = useState(null)

    function renderPreview() {
        return <Image src={(header_url) ? header_url : landscapeFieldImgURI} width={imagePreviewWidth * 0.5} height={imagePreviewHeight} alt={"user header"} />
    }

    function upload() {
        setHeaderLoading(true)
        updateHeader(uid, newHeader!).then(url => {
            setHeaderUrl(url)
            if (onSuccess)
                onSuccess(url)
        }).catch(error => {
            setErrorHeaderMsg(error.message)
        }).finally(() => setHeaderLoading(false))
    }

    switch (region) {
        case "jp":
            return <div>
                <Typography variant="h6">ヘッダー</Typography>
                {(errorHeaderMsg) ? <Alert severity="error" style={{ marginBottom: 8 }}>{errorHeaderMsg}</Alert> : null}
                {renderPreview()}
                <input type="file" onChange={e => setNewHeader(pickImage(e))} className="filetype" accept="image/*" id="group_image" /><br />{(headerLoading) ? <CircularProgress style={{ color: 'white' }} /> : <Button disabled={!newHeader} variant="outlined" onClick={() => {
                    upload()
                }} color="primary" style={{ backgroundColor: 'red', color: "white" }}>
                    アップロード
                </Button>}
            </div>
        default:
            return <div>
                <Typography variant="h6">Header</Typography>
                {(errorHeaderMsg) ? <Alert severity="error" style={{ marginBottom: 8 }}>{errorHeaderMsg}</Alert> : null}
                {renderPreview()}
                <input type="file" onChange={e => setNewHeader(pickImage(e))} className="filetype" accept="image/*" id="group_image" /><br />{(headerLoading) ? <CircularProgress style={{ color: 'white' }} /> : <Button disabled={!newHeader} variant="outlined" onClick={() => {
                    upload()
                }} color="primary" style={{ backgroundColor: 'red', color: "white" }}>
                    Upload
                </Button>}
            </div>
    }
}