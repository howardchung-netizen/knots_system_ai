import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import language from "../localization/language";
import { Stack } from "@mui/system";
import { Chip, Divider } from "@mui/material";



export default function (props) {
  return (
    <TableContainer component={Paper}>
      <Table size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell style={{minWidth: 150}}>{language.role}</TableCell>
            <TableCell>{language.permission}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.roles.map((row) => (
            <TableRow key={row.name}>
              <TableCell sx={{minWidth: 150, maxWidth: "500px", wordBreak: "break-word"}}>
                {row.name}
              </TableCell>
              <TableCell sx={{width: "auto"}}>
                <Stack direction="row" spacing={1}>
                  {
                  row.permissions.map((e, i) =>
                    <Chip key={i} label={e.name} />
                  )
                  }
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}