import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Button, Divider, Grid, Stack } from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { radioFiltetBtnUseStyles } from "../components/RadioFiltetBtn";
import FilterBlock from "../components/FilterBlock";
import { gql, useLazyQuery, useMutation } from "@apollo/client";
import DebouncedInput from "../components/DebouncedInput";
import { createColumnHelper, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { rankItem } from "@tanstack/match-sorter-utils";
import { CreateBtn, RefreshBtn, TableDelBtn, TableEditBtn, TableViewBtn } from "../components/TableActionBtn";
import BackdropLoading from "../components/BackdropLoading";
import { PORJECT_ORDERS_QUERY } from "../apollo/queries";
import { projectOrderFragment } from "../apollo/fragments"; 
import { TableRow } from "../components/TableRow";
import moment from "moment";
import { toMoney } from "../utils";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import RadioButtonUncheckedOutlinedIcon from '@mui/icons-material/RadioButtonUncheckedOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import ProjectOrderFormModal from "../components/project/ProjectOrderFormModal";
import { PROJECT_ORDER_DELETE, PROJECT_ORDER_UPDATE } from "../apollo/mutations";
import { useSnackbar } from "notistack";
import ReactSortableTable from "../components/ReactSortableTable";
import CheckIcon from '@mui/icons-material/Check';
import ProjectOrderSettledmentModal from "../components/project/ProjectOrderSettledmentModal";
import ProjectOrderList from "./ProjectOrderList";

const columnHelper = createColumnHelper();

const fuzzyFilter = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value)
  // Store the itemRank info
  addMeta({
    itemRank,
  })
  // Return if the item should be filtered in/out
  return itemRank.passed
}

export default ({height}) => {

  return (
    <div style={{ height: height??'85vh', width: '100%', padding: 0 }}>
      <div style={{padding: 5, fontWeight: 'bold'}}>訂單列表</div>
      <Divider/>
      <div style={{ width: '100%' }}>
        <div style={{ height: 'auto', width: '100%', padding: 0, position: 'relative' }}>
         <ProjectOrderList />
        </div>
      </div>
    </div>
  )
}
