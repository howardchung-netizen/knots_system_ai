import { CircularProgress, Modal } from "@mui/material"
import PageLoadingProgress from "./PageLoadingProgress"

export default () => {
    return (
        <Modal
            open={true}
        >
             <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                width: '100%'
             }}>
             <PageLoadingProgress color="inherit" />
                <CircularProgress />
             </div>
        </Modal>
    )
}