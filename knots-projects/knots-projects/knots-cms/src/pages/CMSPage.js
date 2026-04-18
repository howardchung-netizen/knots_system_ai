import * as React from 'react';
import { styled, useTheme } from '@mui/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import { Route, Routes } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import Account from './Account';
import { useMediaQuery } from '@mui/material';
import { NavMenuItem } from '../components/NavMenuItem';
import AppSettingsTable from './appSettings/AppSettingsTable';
import Page404 from './Page404';
import RolesTable from './roles/RolesTable';
import PermissionTable from './permission/PermissionTable';
import BackdropLoading from '../components/BackdropLoading';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import {accountMenu, accounttingMenu, claimFormMenu, clockInMenu, customersMenu, dashboardMenu, porjectMenu, quotationMenu, userMenu} from '../constants/pageMenu';
import PagaMenus from './PagaMenus';
import Dashboard from './Dashboard';
import ContactsList from './ContactsList';
import ProjectsList from './ProjectsList';
import ProjectDetail from './ProjectDetail';
import QuotationsList from './QuotationsList';
import ClientList from './ClientList';
import ClientDetail from './ClientDetail';
import ProjectTypeList from './ProjectTypeList';
import ProjectOrderList from './ProjectOrderList';
import ProjectHashtagList from './ProjectHashtagList';
import QuotationTemplateList from './QuotationTemplateList';
import MeasurementList from './MeasurementList';
import ProjectItemList from './ProjectItemList';
import QuotationTemplateDetail from './QuotationTemplateDetail';
import TermsList from './TermsList';
import ProjectInvoiceList from './ProjectInvoiceList';
import QuotationDetail from './QuotationDetail';
import ClockInList from './ClockInList';
import UserList from './UserList';
import ClaimFormList from './ClaimFormList';
import UserDetail from './UserDetail';
import BookKeepingAccountTypeList from './BookKeepingAccountTypeList';
import BookKeepingAccountList from './BookKeepingAccountList';
import BookKeepingAccountDetail from './BookKeepingAccountDetail';
import BookKeepingPeriodExpenseList from './BookKeepingPeriodExpenseList';
import IframeGantt from '../components/iframeGantt';
import TenderFormsList from './TenderFormsList';
import FinancialStatementDetail from './FinancialStatementDetail';
import ProfitSheet from './profitSheet/ProfitSheet';
import ProjectOrder from './ProjectOrder';

const REACT_APP_TOKEN = process.env.REACT_APP_TOKEN;
const REACT_APP_KQS_HTTPS_ENDPOINT = process.env.REACT_APP_KQS_HTTPS_ENDPOINT;
const REACT_APP_TODO_HTTP_ENDPOINT = process.env.REACT_APP_TODO_HTTP_ENDPOINT;
const REACT_APP_TODO_GRAPHQL_ENDPOINT = process.env.REACT_APP_TODO_GRAPHQL_ENDPOINT;
const REACT_APP_TODO_WEBSOCKET_ENDPOINT= process.env.REACT_APP_TODO_WEBSOCKET_ENDPOINT;
const REACT_APP_KQS_SHARE_LINK = process.env.REACT_APP_KQS_SHARE_LINK;
const REACT_APP_EXPORT_SERVER_HOST = process.env.REACT_APP_EXPORT_SERVER_HOST;
const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme, ismobile) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: ismobile ? `0px` : `64px`
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => {
  return ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
      marginLeft: drawerWidth,
      width: `calc(100% - ${drawerWidth}px)`,
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
  })
});

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open, ismobile }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme, ismobile),
      '& .MuiDrawer-paper': closedMixin(theme, ismobile),
    }),
  }),
);

export default function MiniDrawer() {

  const toDay = new Date();
  const [user, userDispatch] = React.useContext(UserContext);
  const appToken = user?.token;

  const theme = useTheme();
  const [open, setOpen] = React.useState(true);
  const [currentPage, setCurrentPage] = React.useState(window.location.pathname);
  const lessThanSmall = useMediaQuery(theme.breakpoints.down("sm"));

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);

  const menuId = 'primary-search-account-menu';

  const isMenuOpen = Boolean(anchorEl);

  const handleDrawerOpen = () => {
    setOpen(true);
  }

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const onLogoutClick = ()=> {
    userDispatch({type:"LOGOUT"})
    handleMenuClose()
  }
  
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={onLogoutClick}>登出</MenuItem>
    </Menu>
  )
  
  if(!user.info) return <BackdropLoading/>

  return (
    <div style={{height: "100%", width: "100%"}}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: 5,
              ...(open && { display: 'none' }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            {process.env.REACT_APP_WEBSITE_TITLE}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            <IconButton
              size="small"
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              {user?.info?.username}
              <AccountCircle />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      {renderMenu}
      <div style={{ display: "flex", height: "100%" }}>
        <Drawer variant="permanent" open={open} ismobile={lessThanSmall? 1: 0}>
          <DrawerHeader>
            <IconButton onClick={()=> setOpen(!open)}>
              {!open ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </DrawerHeader>
          <Divider />
          <List sx={{padding: 0}}>
            <PagaMenus menu={dashboardMenu} open={open} selectedPath={currentPage} onMenuClick={(to)=> {setCurrentPage(to)}}/>
            <Divider/>
            <PagaMenus menu={customersMenu} open={open} selectedPath={currentPage} onMenuClick={(to)=> {setCurrentPage(to)}}/>
            <Divider/>
            <PagaMenus menu={porjectMenu} open={open} selectedPath={currentPage} onMenuClick={(to)=> {setCurrentPage(to)}}/>
            <Divider/>
            <PagaMenus menu={quotationMenu} open={open} selectedPath={currentPage} onMenuClick={(to)=> {setCurrentPage(to)}}/>
            <Divider/>
            <PagaMenus menu={accounttingMenu} open={open} selectedPath={currentPage} onMenuClick={(to)=> {setCurrentPage(to)}}/>
            <Divider/>
            <PagaMenus menu={clockInMenu} open={open} selectedPath={currentPage} onMenuClick={(to)=> {setCurrentPage(to)}}/>
            <Divider/>
            <PagaMenus menu={claimFormMenu} open={open} selectedPath={currentPage} onMenuClick={(to)=> {setCurrentPage(to)}}/>
            <Divider/>
            {
             user.info.roles.find(e=> e.name == 'HR' || e.name == 'admin') && <>
                <PagaMenus menu={userMenu} open={open} selectedPath={currentPage} onMenuClick={(to) => { setCurrentPage(to) }} />
                <Divider />
              </>
            }
            <PagaMenus menu={accountMenu} open={open} selectedPath={currentPage} onMenuClick={(to)=> {setCurrentPage(to)}}/>
            <Divider/>
            <NavMenuItem
              key={"/logout"}
              // to={"/logout"}
              text={"登出"}
              icon={<ExitToAppIcon />}
              onMenuClick={() => onLogoutClick()}
              open={open}
            />
          </List>
        </Drawer>
        <div id='main-container' style={{ height: "100vh", width: lessThanSmall ? `calc(100vw - ${open ? drawerWidth : 0 }px)` : `calc(100vw - ${open ? drawerWidth : 64 }px)`, flexDirection: "column", backgroundColor: '#F4F5FA', overflow: 'auto', transition: 'width 320ms'}}>
          <DrawerHeader />
          <Box sx={{ flexGrow: 1, p: 0, position: "relative" }}>
            <Routes>
              <Route path="gantt_chart/share/:code/:projectId"
                element={<IframeGantt
                  appToken={REACT_APP_TOKEN}
                  REACT_APP_KQS_HTTPS_ENDPOINT={REACT_APP_KQS_HTTPS_ENDPOINT}
                  REACT_APP_TODO_HTTP_ENDPOINT={REACT_APP_TODO_HTTP_ENDPOINT}
                  REACT_APP_TODO_GRAPHQL_ENDPOINT={REACT_APP_TODO_GRAPHQL_ENDPOINT}
                  REACT_APP_TODO_WEBSOCKET_ENDPOINT={REACT_APP_TODO_WEBSOCKET_ENDPOINT}
                  REACT_APP_KQS_SHARE_LINK={REACT_APP_KQS_SHARE_LINK}
                  REACT_APP_EXPORT_SERVER_HOST={REACT_APP_EXPORT_SERVER_HOST}
                />
                }
              />
              <Route path="gantt_chart/project/:projectId"
                element={<IframeGantt
                  appToken={REACT_APP_TOKEN}
                  REACT_APP_KQS_HTTPS_ENDPOINT={REACT_APP_KQS_HTTPS_ENDPOINT}
                  REACT_APP_TODO_HTTP_ENDPOINT={REACT_APP_TODO_HTTP_ENDPOINT}
                  REACT_APP_TODO_GRAPHQL_ENDPOINT={REACT_APP_TODO_GRAPHQL_ENDPOINT}
                  REACT_APP_TODO_WEBSOCKET_ENDPOINT={REACT_APP_TODO_WEBSOCKET_ENDPOINT}
                  REACT_APP_KQS_SHARE_LINK={REACT_APP_KQS_SHARE_LINK}
                  REACT_APP_EXPORT_SERVER_HOST={REACT_APP_EXPORT_SERVER_HOST}
                />
                }
              />
              <Route path="Dashboard" element={<Dashboard />} />
              <Route path="clients" element={<ClientList />} />
              <Route path="client/:clientId" element={<ClientDetail />} />
              <Route path="contacts" element={<ContactsList />} />
              <Route path="projects" element={<ProjectsList />} />
              <Route path="project_type" element={<ProjectTypeList />} />
              <Route path="project_order" element={<ProjectOrder />} />
              <Route path="hashtag" element={<ProjectHashtagList />} />
              <Route path="quotations" element={<QuotationsList />} />
              <Route path="/quotation/:quotationId" element={<QuotationDetail/>} />
              <Route path="template" element={<QuotationTemplateList />} />
              <Route path="template/:templateId" element={<QuotationTemplateDetail />} />
              <Route path="measurement" element={<MeasurementList />} />
              <Route path="project_item" element={<ProjectItemList />} />
              <Route path="project/:projectId" element={<ProjectDetail />} />
              <Route path="profit_sheet/:projectId" element={<ProfitSheet />} />
              <Route path="terms" element={<TermsList />} />
              <Route path="invoice" element={<ProjectInvoiceList />} />
              <Route path="clock_in" element={<ClockInList />} />
              <Route path="users" element={<UserList />} />
              <Route path="claim_form" element={<ClaimFormList />} />
              <Route path="book_keeping_account_types" element={<BookKeepingAccountTypeList />} />
              <Route path="book_keeping_accounts" element={<BookKeepingAccountList />} />
              <Route path="/book_keeping_account_detail/:accountId" element={<BookKeepingAccountDetail />} />
              <Route path="book_keeping_period_expenses" element={<BookKeepingPeriodExpenseList />} />
              <Route path="financial_statement" element={<FinancialStatementDetail />} />
              <Route path="tenders" element={<TenderFormsList />} />
              <Route path="Account" element={<Account />} />
              <Route path="/staff/:staffId" element={<UserDetail />} />
              <Route path="Settings" element={<AppSettingsTable />} />
              <Route path="Roles" element={<RolesTable />} />
              <Route path="Permissions" element={<PermissionTable />} />
              <Route path="*" element={<Page404 />} />
            </Routes>
          </Box>
        </div>
      </div>
    </div>
  );

}