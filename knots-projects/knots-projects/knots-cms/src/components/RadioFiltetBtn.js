import React, { useEffect, useMemo } from "react";
import { Button, FormControlLabel, Radio, RadioGroup} from "@mui/material";
import { makeStyles } from "@mui/styles";

export const radioFiltetBtnUseStyles = makeStyles({
  radioWrap: {
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.4)',
    borderStyle: 'double',
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    color: 'rgba(0, 0, 0, 0.7)', 
    borderRadius: 5, 
    paddingLeft: 10,
    marginRight: 5,
    cursor: 'pointer',
    marginTop: 1
  }, 
  radioWrapSelected: {
    borderWidth: 1,
    borderColor: 'rgb(84 149 234)',
    borderStyle: 'double',
    backgroundColor: 'rgb(84 149 234)',
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    color: 'white !important', 
    borderRadius: 5, 
    paddingLeft: 10,
    marginRight: 5,
    cursor: 'pointer',
    marginTop: 1
  }
});

export default ({ title, onChange, option, value }) => {
    const classes = radioFiltetBtnUseStyles();
    return (
        <div className={option == value ? classes.radioWrapSelected : classes.radioWrap}>
            <FormControlLabel
                control={
                    <Radio
                        color="whiteColor"
                        onChange={onChange}
                        value={option}
                    />
                }
                label={<span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                    {title}
                </span>}
            />
        </div>
    )
}