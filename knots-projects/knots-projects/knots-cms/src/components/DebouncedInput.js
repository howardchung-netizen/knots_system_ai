import React from "react";
import Input from "./Input";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme) => ({
  inputLabel: {
    fontStyle: 'italic', // 设置斜体样式
  },
}));

export default function DebouncedInput({
    value: initialValue,
    onChange,
    debounce = 500,
    ...props
  }) {

    const classes = useStyles();
    const [value, setValue] = React.useState(initialValue)
  
    React.useEffect(() => {
      setValue(initialValue)
    }, [initialValue])
  
    React.useEffect(() => {
      const timeout = setTimeout(() => {
        onChange(value)
      }, debounce)
  
      return () => clearTimeout(timeout)
    }, [value])
  
    return (
      <Input 
      variant="standard"
      {...props} 
      value={value}
      onChange={e => setValue(e.target.value)} />
    )
  }
  