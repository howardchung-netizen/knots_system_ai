import { TextField } from "@mui/material";
import { styled } from "@mui/styles";
import { DesktopDatePicker } from "@mui/x-date-pickers";
import { useRef, useState } from "react";

const Input = styled(TextField)(() => ({
    width: '100%'
  }));

export default (props) => {
    const InputLabelPropsBgc = props.variant == 'filled' ? null : 'white';
    const className = props.InputProps?.readOnly ? 'input-readOnly' : '';
    const backgroundColor = props.InputProps?.readOnly ? 'input-readOnly' : '';
    const inputRef= useRef();
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    // if (props.type && props.type.toLowerCase() == 'date' && !props.disabled) return (
    //     <DesktopDatePicker
    //         dayOfWeekFormatter={(day) => `${day}`}
    //         label={props.label}
    //         inputFormat="YYYY-MM-DD"
    //         value={props.value}
    //         error={props.error}
    //         onChange={(e) => {
    //             if (props.onChange) props.onChange({
    //                 target: {
    //                     value: e.format('YYYY-MM-DD')
    //                 },
    //                 value: e.format('YYYY-MM-DD')
    //             })
    //         }}
    //         disabled={props.disabled}
    //         PopperProps={{
    //             placement: "bottom-start",
    //             ...props.PopperProps

    //         }}
    //         open={isPickerOpen}
    //         onOpen={() => {
    //             if (props.InputProps?.readOnly) return;
    //             setIsPickerOpen(true)
    //         }}
    //         onClose={() => setIsPickerOpen(false)}
    //         renderInput={(params) => <Input
    //             InputLabelProps={{ style: { fontSize: 20, backgroundColor: InputLabelPropsBgc, marginTop: '2px' } }}
    //             {...params}
    //             {...props}
    //             InputProps={{readOnly: true, ...props.InputProps}}
    //             sx={{ input: { cursor: 'pointer' } }}
    //             onClick={() => { setIsPickerOpen(true) }}
    //             error={props.error ? true : false}
    //             value={props.value == null ? '' : props.value}
    //         />}
    //         slotProps={{
    //             actionBar: { actions: ["today"] },
    //          }}
    //     />
    // )

    return (
        <Input
            inputRef={(ref)=>inputRef.current = ref}
            {...props}
            InputLabelProps={{ 
                style: { 
                    fontSize: 18,
                    backgroundColor: 'none', //InputLabelPropsBgc
                    marginTop: '2px',
                    // fontStyle: 'italic', // 设置斜体样式
                 }, 
                 shrink: true,
                 ...props.InputLabelProps 
                }
            }
            InputProps={{
                // sx: {
                //     backgroundColor: 'white'
                // },
                inputProps: { 
                min: "1900-01-01", 
                max: "2100-12-31",
                } ,
                ...props.InputProps
            }}
            onClick={()=>{
                // if(props.type == 'date')inputRef.current.showPicker()
            }}
            error={props.error ? true: false}
            value={props.value == null ? '' : props.value }
        />
    )
}