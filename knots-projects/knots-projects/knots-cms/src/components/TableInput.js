import { useState } from "react";
import Input from "./Input";

export default ({ type, value, onChange, onBlur, formatValue }) => {
    const [tempValue, setTempValue] = useState(value);
    const [openEdit, setOpenEdit] = useState(false);
    const focusUsernameInputField = input => {
        if (input) {
            input.focus()
        }
    };
    const _onBlur = (e) => {
        if (onBlur) onBlur(e)
        setOpenEdit(false);
    }
    return (
        <div
            style={{ cursor: 'pointer', width: '100%', height: '100%', alignItems: 'center', display: 'flex'}}
            onDoubleClick={() => {
                if (openEdit) return
                setOpenEdit(true)
            }}>
            {
                openEdit ?
                    <Input
                        inputRef={focusUsernameInputField}
                        inputProps={{ style: { fontSize: '0.875rem' } }}
                        style={{ width: 'auto' }}
                        type={type}
                        value={tempValue}
                        onChange={(e) => {
                            setTempValue(e.target.value)
                        }}
                        onBlur={_onBlur}
                    />
                    : formatValue ?? value
            }
        </div>
    )
}
