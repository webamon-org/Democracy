import { useState } from "react";
import { ProSidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { Box, IconButton, Typography, Button, useTheme } from "@mui/material";
import { Link } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../../theme";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import GppMaybeOutlinedIcon from '@mui/icons-material/GppMaybeOutlined';
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import ApiOutlinedIcon from '@mui/icons-material/ApiOutlined';
import WysiwygOutlinedIcon from '@mui/icons-material/WysiwygOutlined';
import WebhookOutlinedIcon from '@mui/icons-material/WebhookOutlined';
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import RadarOutlinedIcon from '@mui/icons-material/RadarOutlined';
import AdsClickIcon from '@mui/icons-material/AdsClick';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import SettingsInputSvideoIcon from '@mui/icons-material/SettingsInputSvideo';
import DnsIcon from '@mui/icons-material/Dns';
import PublicIcon from '@mui/icons-material/Public';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import AssistantIcon from '@mui/icons-material/Assistant';
import DynamicFeedIcon from '@mui/icons-material/DynamicFeed';
import SettingsIcon from '@mui/icons-material/Settings';
import React from 'react';
import { Auth } from 'aws-amplify';

const Item = ({ title, to, icon, selected, setSelected, locked = false, setIsCollapsed }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const handleClick = () => {
    if (!locked) {
      setSelected(title);
      setIsCollapsed(false);
    }
  };

  return (
    <MenuItem
      active={selected === title}
      style={{
        color: colors.grey[100],
      }}
      onClick={handleClick}
      disabled={locked}
      icon={
        <Box display="flex" alignItems="center">
          {icon}
          {locked && (
            <LockOutlinedIcon
              fontSize="small"
              sx={{ ml: 1, color: colors.grey[500] }}
            />
          )}
        </Box>
      }
    >
      <Typography>{title}</Typography>
      {!locked && <Link to={to} />}
    </MenuItem>
  );
};

const Sidebar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");

  const LogoutButton = () => {
    const handleLogout = async () => {
      try {
        await Auth.signOut();
        window.location.href = '/'; // Redirect to the login page
      } catch (error) {
        console.error('Error signing out: ', error);
      }
    };

    return (
      <Button variant="contained" color="primary" onClick={handleLogout}>
        Logout
      </Button>
    );
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
   <Box
      sx={{
        "& .pro-sidebar-inner": {
          background: `${colors.primary[400]} !important`,
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "5px 20px 5px 15px !important",
        },
        "& .pro-inner-item:hover": {
          color: "#868dfb !important",
        },
        "& .pro-menu-item.active": {
          color: "#6870fa !important",
        },
        "& .pro-sidebar": {
          width: isCollapsed ? '80px' : '200px',
          transition: 'width 0.3s ease',
        },
      }}
    >

 <ProSidebar collapsed={isCollapsed}>
        <Typography>v0.2.5</Typography>
        <Menu iconShape="square">
          {/* LOGO AND MENU ICON */}
          <MenuItem
            icon={<MenuOutlinedIcon />}
            style={{
              margin: "10px 0 20px 0",
              color: colors.grey[100],
            }}
            onClick={toggleSidebar} // Toggle sidebar on click
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
              </Box>
            )}
          </MenuItem>

          {!isCollapsed && (
            <Box mb="25px">
              <Box display="flex" justifyContent="center" alignItems="center">
                <a>
                  <img
                    alt="webamon-logo"
                    width="180px"
                    height="90px"
                    src={`../../assets/footer-logo.png`}
                    style={{ cursor: "pointer" }}
                  />
                </a>
              </Box>
            </Box>
          )}

          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            <Item
              title="Dashboard"
              to="/dashboard"
              icon={<HomeOutlinedIcon style={{ fontSize: '2rem' }} />}
              selected={selected}
              setSelected={setSelected}
              setIsCollapsed={setIsCollapsed}
            />
            <Typography variant="h3" color={colors.grey[300]} sx={{ m: "10px 0 5px 20px" }} ></Typography>
            <Item
              title="Sandbox"
              to="/sandbox"
              icon={<AdsClickIcon style={{ fontSize: '2rem' }} />}
              selected={selected}
              setSelected={setSelected}
              setIsCollapsed={setIsCollapsed}
            />

            <Typography variant="h3" color={colors.grey[300]} sx={{ m: "10px 0 5px 20px" }} ></Typography>
            <Item
              title="Scans"
              to="/scans"
              icon={<RadarOutlinedIcon style={{ fontSize: '2rem' }} />}
              selected={selected}
              setSelected={setSelected}
              setIsCollapsed={setIsCollapsed}
            />
            <Typography variant="h3" color={colors.grey[300]} sx={{ m: "10px 0 5px 20px" }} ></Typography>
            <Item
              title="Threat AI"
              to="/threat-ai"
              icon={<AssistantIcon style={{ fontSize: '2rem' }} />}
              selected={selected}
              setSelected={setSelected}
              setIsCollapsed={setIsCollapsed}
            />
            <Typography variant="h3" color={colors.grey[300]} sx={{ m: "10px 0 5px 20px" }} ></Typography>
            <SubMenu
              title="Monitoring"
              icon={<MonitorHeartIcon style={{ fontSize: '2rem' }} />}
              style={{
                color: colors.grey[100],
              }}
            >
              <Item
                title="Detections"
                to="/detections"
                icon={<GppMaybeOutlinedIcon style={{ fontSize: '2rem' }} />}
                selected={selected}
                setSelected={setSelected}
                setIsCollapsed={setIsCollapsed}
              />
              <Item
                title="Campaigns"
                to="/campaigns"
                icon={<AccountTreeIcon style={{ fontSize: '2rem' }} />}
                selected={selected}
                setSelected={setSelected}
                setIsCollapsed={setIsCollapsed}
              />
              <Item
                title="Schedules"
                to="/schedules"
                icon={<CalendarTodayOutlinedIcon style={{ fontSize: '2rem' }} />}
                selected={selected}
                setSelected={setSelected}
                setIsCollapsed={setIsCollapsed}
              />
            </SubMenu>
            <Typography variant="h3" color={colors.grey[300]} sx={{ m: "10px 0 5px 20px" }} ></Typography>
            <SubMenu
              title="Assets"
              icon={<FolderOpenIcon style={{ fontSize: '2rem' }} />}
              style={{
                color: colors.grey[100],
              }}
            >
              <Item
                title="Resources"
                to="/resources"
                icon={<WysiwygOutlinedIcon style={{ fontSize: '1.5rem' }} />}
                selected={selected}
                setSelected={setSelected}
                setIsCollapsed={setIsCollapsed}
              />
              <Item
                title="Domains"
                to="/domains"
                icon={<PublicIcon style={{ fontSize: '2rem' }} />}
                selected={selected}
                setSelected={setSelected}
                setIsCollapsed={setIsCollapsed}
              />
              <Item
                title="Servers"
                to="/servers"
                icon={<DnsIcon style={{ fontSize: '2rem' }} />}
                selected={selected}
                setSelected={setSelected}
                setIsCollapsed={setIsCollapsed}
              />
            </SubMenu>
            <Typography variant="h3" color={colors.grey[300]} sx={{ m: "10px 0 5px 20px" }} ></Typography>
            <SubMenu
              title="Feeds"
              icon={<DynamicFeedIcon style={{ fontSize: '2rem' }} />}
              style={{
                color: colors.grey[100],
              }}
            >
              <Item
                title="Newly Registered"
                to="/feeds/newly-registered"
                icon={<WysiwygOutlinedIcon style={{ fontSize: '1.5rem' }} />}
                selected={selected}
                setSelected={setSelected}
                setIsCollapsed={setIsCollapsed}
              />
            <Item
              title="All Domains"
              to="/feeds/all-domains"
              icon={<WysiwygOutlinedIcon style={{ fontSize: '1.5rem' }} />}
              selected={selected}
              setSelected={setSelected}
              setIsCollapsed={setIsCollapsed}
            />
              <Item
                title="Webamon-Xtend"
                to="/feeds/webamon-x"
                icon={<WysiwygOutlinedIcon style={{ fontSize: '1.5rem' }} />}
                selected={selected}
                setSelected={setSelected}
                setIsCollapsed={setIsCollapsed}
              />
              <Typography variant="h3" color={colors.grey[300]} sx={{ m: "10px 0 5px 20px" }} ></Typography>
            </SubMenu>
            <SubMenu
              title="Settings"
              icon={<SettingsIcon style={{ fontSize: '2rem' }} />}
              style={{
                color: colors.grey[100],
              }}
            >
              <Item
                title="Sources"
                to="/sources"
                icon={<SettingsInputSvideoIcon style={{ fontSize: '2rem' }} />}
                selected={selected}
                setSelected={setSelected}
                setIsCollapsed={setIsCollapsed}
              />
              <Item
                title="API"
                to="/api"
                icon={<ApiOutlinedIcon style={{ fontSize: '2rem' }} />}
                selected={selected}
                setSelected={setSelected}
                setIsCollapsed={setIsCollapsed}
              />
              <Item
                title="Event Trigger"
                to="/trigger"
                icon={<WebhookOutlinedIcon style={{ fontSize: '2rem' }} />}
                selected={selected}
                setSelected={setSelected}
                setIsCollapsed={setIsCollapsed}
              />
              <Item
                title="Docs"
                to="/docs"
                icon={<DescriptionOutlinedIcon style={{ fontSize: '2rem' }} />}
                selected={selected}
                setSelected={setSelected}
                setIsCollapsed={setIsCollapsed}
              />
            </SubMenu>
            <Typography
              variant="h3"
              color={colors.grey[300]}
              sx={{ m: "60px 0 5px 20px" }}
            ></Typography>
            <Item
              title="Feedback"
              to="/support"
              icon={<SupportAgentOutlinedIcon style={{ fontSize: '2rem' }} />}
              selected={selected}
              setSelected={setSelected}
              setIsCollapsed={setIsCollapsed}
            />
          </Box>
        </Menu>
        <LogoutButton />
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;
