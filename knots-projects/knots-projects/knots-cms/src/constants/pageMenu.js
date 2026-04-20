import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AddIcCallIcon from '@mui/icons-material/AddIcCall';
import ContactPageIcon from '@mui/icons-material/ContactPage';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import ChecklistIcon from '@mui/icons-material/Checklist';
import ClassIcon from '@mui/icons-material/Class';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import TagIcon from '@mui/icons-material/Tag';
import DateRangeIcon from '@mui/icons-material/DateRange';
import TableViewIcon from '@mui/icons-material/TableView';
import BackupTableIcon from '@mui/icons-material/BackupTable';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import LayersIcon from '@mui/icons-material/Layers';
import CategoryIcon from '@mui/icons-material/Category';
import FeaturedPlayListIcon from '@mui/icons-material/FeaturedPlayList';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';
import GroupAddIcon from '@mui/icons-material/GroupAdd';

export const dashboardMenu = [{
    text: '今日資訊',
    to: '/cms/dashboard',
    icon: <DashboardIcon />,
    permissions: [{ resource: "Dashboard", action: "GET" }],
    subMenu: [],
}];

// export const customersMenu = [{
//     text: '客戶管理',
//     icon: <ContactPageIcon />,
//     permissions: [{ resource: "Dashboard", action: "GET" }],
//     subMenu: [
//         {
//             text: '客戶',
//             to: '/cms/clients',
//             icon: <PersonAddIcon />,
//             permissions: [{ resource: "Dashboard", action: "GET" }],
//             subMenu: [
                
//             ],
//         },
//         {
//             text: '聯絡人',
//             to: '/cms/contacts',
//             icon: <AddIcCallIcon />,
//             permissions: [{ resource: "Dashboard", action: "GET" }],
//             subMenu: [
                
//             ],
//         }
//     ],
// }];

// export const porjectMenu = [{
//     text: '工程管理',
//     icon: <AccountTreeIcon />,
//     permissions: [{ resource: "Dashboard", action: "GET" }],
//     subMenu: [
//         {
//             text: '工程',
//             to: '/cms/projects',
//             icon: <HomeWorkIcon />,
//             permissions: [{ resource: "Dashboard", action: "GET" }],
//             subMenu: [
        
//             ],
//         },
//         {
//             text: '類型列表',
//             to: '/cms/type',
//             icon: <ClassIcon />,
//             permissions: [{ resource: "Dashboard", action: "GET" }],
//             subMenu: [
        
//             ],
//         },
//         {
//             text: '訂單',
//             to: '/cms/order',
//             icon: <ShoppingCartIcon />,
//             permissions: [{ resource: "Dashboard", action: "GET" }],
//             subMenu: [
        
//             ],
//         },
//         {
//             text: '工程標籤',
//             to: '/cms/hashtag',
//             icon: <TagIcon />,
//             permissions: [{ resource: "Dashboard", action: "GET" }],
//             subMenu: [
        
//             ],
//         }
//     ],
// }];

// export const toDoListMenu = [{
//     text: '待辦事項',
//     to: '/cms/to_do_list',
//     icon: <ChecklistIcon />,
//     permissions: [{ resource: "Dashboard", action: "GET" }],
//     subMenu: [

//     ],
// }];

// export const agendaMenu = [{
//     text: '日程表',
//     to: '/cms/agenda',
//     icon: <DateRangeIcon />,
//     permissions: [{ resource: "Dashboard", action: "GET" }],
//     subMenu: [

//     ],
// }];

// export const quotationMenu = [{
//     text: '報價單管理',
//     icon: <TableViewIcon />,
//     permissions: [{ resource: "Dashboard", action: "GET" }],
//     subMenu: [
//         {
//             text: '報價單',
//             to: '/cms/quotations',
//             icon: <BackupTableIcon />,
//             permissions: [{ resource: "Dashboard", action: "GET" }],
//             subMenu: [
        
//             ],
//         },
//         {
//             text: '報價模板',
//             to: '/cms/template',
//             icon: <LayersIcon />,
//             permissions: [{ resource: "Dashboard", action: "GET" }],
//             subMenu: [
        
//             ],
//         },
//         {
//             text: '報價條款',
//             to: '/cms/terms',
//             icon: <FormatListNumberedIcon />,
//             permissions: [{ resource: "Dashboard", action: "GET" }],
//             subMenu: [
        
//             ],
//         },
//         {
//             text: '項目',
//             to: '/cms/item',
//             icon: <FeaturedPlayListIcon />,
//             permissions: [{ resource: "Dashboard", action: "GET" }],
//             subMenu: [
        
//             ],
//         },
//         {
//             text: '度量/單位',
//             icon: <CategoryIcon />,
//             permissions: [{ resource: "Dashboard", action: "GET" }],
//             subMenu: [
        
//             ],
//         }
//     ],
// }];

export const customersMenu = [{
    text: '客戶',
    to: '/cms/clients',
    icon: <PersonAddIcon />,
    permissions: [{ resource: "Dashboard", action: "GET" }],
    subMenu: [
        
    ],
},
{
    text: '聯絡人',
    to: '/cms/contacts',
    icon: <AddIcCallIcon />,
    permissions: [{ resource: "Dashboard", action: "GET" }],
    subMenu: [
        
    ],
}];

export const porjectMenu = [{
    text: '工程專案',
    to: '/cms/projects',
    icon: <HomeWorkIcon />,
    permissions: [{ resource: "Dashboard", action: "GET" }],
    subMenu: [

    ],
},
{
    text: '工程類型',
    to: '/cms/project_type',
    icon: <ClassIcon />,
    permissions: [{ resource: "Dashboard", action: "GET" }],
    subMenu: [

    ],
},
{
    text: '訂單',
    to: '/cms/project_order',
    icon: <ShoppingCartIcon />,
    permissions: [{ resource: "Dashboard", action: "GET" }],
    subMenu: [

    ],
},
{
    text: '工程標籤',
    to: '/cms/hashtag',
    icon: <TagIcon />,
    permissions: [{ resource: "Dashboard", action: "GET" }],
    subMenu: [

    ],
}];

export const toDoListMenu = [{
    text: '待辦事項',
    to: '/cms/to_do_list',
    icon: <ChecklistIcon />,
    permissions: [{ resource: "Dashboard", action: "GET" }],
    subMenu: [

    ],
}];

export const agendaMenu = [{
    text: '日程表',
    to: '/cms/agenda',
    icon: <DateRangeIcon />,
    permissions: [{ resource: "Dashboard", action: "GET" }],
    subMenu: [

    ],
}];

export const quotationMenu = [{
    text: '報價單',
    to: '/cms/quotations',
    icon: <BackupTableIcon />,
    permissions: [{ resource: "Dashboard", action: "GET" }],
    subMenu: [

    ],
},
{
    text: '報價模板',
    to: '/cms/template',
    icon: <LayersIcon />,
    permissions: [{ resource: "Dashboard", action: "GET" }],
    subMenu: [

    ],
},
{
    text: '條款',
    to: '/cms/terms',
    icon: <FormatListNumberedIcon />,
    permissions: [{ resource: "Dashboard", action: "GET" }],
    subMenu: [

    ],
},
{
    text: '項目',
    to: '/cms/project_item',
    icon: <FeaturedPlayListIcon />,
    permissions: [{ resource: "Dashboard", action: "GET" }],
    subMenu: [

    ],
},
{
    text: '度量/單位',
    to: '/cms/measurement',
    icon: <CategoryIcon />,
    permissions: [{ resource: "Dashboard", action: "GET" }],
    subMenu: [

    ],
}];

export const accounttingMenu = [
    // --- 舊版會計功能 (隱藏停用區，等待會計測試新 Excel 系統無誤後刪除) ---
    // {
    //     text: '會計紀錄',
    //     to: '/cms/book_keeping_accounts',
    //     icon: <BackupTableIcon />,
    //     permissions: [{ resource: "Dashboard", action: "GET" }],
    //     subMenu: [],
    // },
    // {
    //     text: '自動入帳',
    //     to: '/cms/book_keeping_period_expenses',
    //     icon: <BackupTableIcon />,
    //     permissions: [{ resource: "Dashboard", action: "GET" }],
    //     subMenu: [],
    // },
    // {
    //     text: '財務報表',
    //     to: '/cms/financial_statement?tab=0',
    //     icon: <FormatListNumberedIcon />,
    //     permissions: [{ resource: "Dashboard", action: "GET" }],
    //     subMenu: [],
    // },
    // -----------------------------------------------------

    // +++ 全新原生會計模組 (依據 Excel 重製) +++
    {
        text: '生存導航 (Dashboard)',
        to: '/cms/accounting/dashboard',
        icon: <DashboardIcon />,
        permissions: [{ resource: "Dashboard", action: "GET" }],
        subMenu: [],
    },
    {
        text: '專案利潤 (MAIN)',
        to: '/cms/accounting/main',
        icon: <TableViewIcon />,
        permissions: [{ resource: "Dashboard", action: "GET" }],
        subMenu: [],
    },
    {
        text: '應收帳款 (AR)',
        to: '/cms/accounting/ar_list',
        icon: <BackupTableIcon />,
        permissions: [{ resource: "Dashboard", action: "GET" }],
        subMenu: [],
    },
    {
        text: '供應商應付 (Payable)',
        to: '/cms/accounting/payable_list',
        icon: <FormatListNumberedIcon />,
        permissions: [{ resource: "Dashboard", action: "GET" }],
        subMenu: [],
    },
    {
        text: '營運開銷 (Overhead)',
        to: '/cms/accounting/overhead',
        icon: <LayersIcon />,
        permissions: [{ resource: "Dashboard", action: "GET" }],
        subMenu: [],
    }
];

export const accountMenu = [{
    text: '帳號',
    to: '/cms/account',
    icon: <AccountCircleIcon />,
    permissions: [{ resource: "Dashboard", action: "GET" }],
    subMenu: [],
}];

export const clockInMenu = [{
    text: '打卡紀錄',
    to: '/cms/clock_in',
    icon: <CategoryIcon />,
    permissions: [{ resource: "Dashboard", action: "GET" }],
    subMenu: [],
}];

export const claimFormMenu = [{
    text: '報銷申請',
    to: '/cms/claim_form',
    icon: <CategoryIcon />,
    permissions: [{ resource: "Dashboard", action: "GET" }],
    subMenu: [],
}];

export const userMenu = [{
    text: '員工管理',
    icon: <GroupAddIcon />,
    permissions: [{ resource: "Dashboard", action: "GET" }],
    subMenu: [
        {
            text: '員工',
            to: '/cms/users',
            icon: <GroupAddIcon />,
            permissions: [{ resource: "Dashboard", action: "GET" }],
            subMenu: [],
        },
        {
            text: 'Tender查詢',
            to: '/cms/tenders',
            icon: <ForwardToInboxIcon />,
            permissions: [{ resource: "Dashboard", action: "GET" }],
            subMenu: [],
        }
    ],
}];


