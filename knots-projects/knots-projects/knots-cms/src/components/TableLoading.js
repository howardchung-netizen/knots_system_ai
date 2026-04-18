import { CircularProgress } from "@mui/material"

export default () => {
    return (
        <div style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            zIndex: 10000000,
            backgroundColor: '#ffffff80',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}
        >
            <CircularProgress />
        </div>
    )
} 