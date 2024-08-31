import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Sidebar from "./scenes/global/Sidebar";
import ComingSoon from "./scenes/global/coming";
import AuthenticationPage from "./scenes/login";
import ReportDialog from "./scenes/sandbox";
import BugReport from './scenes/support';
import SwaggerDocs from "./scenes/docs";
import Scans from "./scenes/scans";
import Domains from "./scenes/domains";
import ServerPage from "./scenes/servers";
import AssetsPage from "./scenes/resources";
import WebamonXtend from "./scenes/feeds/webamon_x";
import NewlyRegistered from "./scenes/feeds/newly_registered";
import AllDomains from "./scenes/feeds/all_domains";
import ProtectedRoute from './ProtectedRoute';
import { CssBaseline, ThemeProvider } from "@mui/material";
import { useMode } from "./theme";
import './styles.css'; // Import the CSS file here

function App() {
    const [theme, colorMode] = useMode();
    const location = useLocation();
    const isLoginPage = location.pathname === '/login';

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <div className="app">
                {!isLoginPage && <Sidebar className="sidebar" />}
                <main className="content">
                    <Routes>
                        <Route path="/login" element={<AuthenticationPage />} />
                        <Route path="/" element={<Navigate to="/login" />} />
                        <Route path="*" element={<Navigate to="/login" />} /> {/* Redirect unknown paths to /login */}
                        <Route path="/sandbox" element={<ProtectedRoute element={<ReportDialog />} />} />
                        <Route path="/license" element={<ProtectedRoute element={<ComingSoon />} />} />
                        <Route path="/detections" element={<ProtectedRoute element={<ComingSoon />} />} />
                        <Route path="/docs" element={<SwaggerDocs />} />
                        <Route path="/scans" element={<ProtectedRoute element={<Scans />} />} />
                        <Route path="/domains" element={<ProtectedRoute element={<Domains />} />} />
                        <Route path="/schedules" element={<ProtectedRoute element={<ComingSoon />} />} />
                        <Route path="/users" element={<ProtectedRoute element={<ComingSoon />} />} />
                        <Route path="/api" element={<ProtectedRoute element={<ComingSoon />} />} />
                        <Route path="/servers" element={<ProtectedRoute element={<ServerPage />} />} />
                        <Route path="/sources" element={<ProtectedRoute element={<ComingSoon />} />} />
                        <Route path="/support" element={<ProtectedRoute element={<BugReport />} />} />
                        <Route path="/trigger" element={<ProtectedRoute element={<ComingSoon />} />} />
                        <Route path="/dashboard" element={<ProtectedRoute element={<ComingSoon />} />} />
                        <Route path="/threat-ai" element={<ProtectedRoute element={<ComingSoon />} />} />
                        <Route path="/resources" element={<ProtectedRoute element={<AssetsPage />} />} />
                        <Route path="/hunting" element={<ProtectedRoute element={<ComingSoon />} />} />
                        <Route path="/campaigns" element={<ProtectedRoute element={<ComingSoon />} />} />
                        <Route path="/feeds/webamon-x" element={<ProtectedRoute element={<WebamonXtend />} />} />
                        <Route path="/feeds/all-domains" element={<ProtectedRoute element={<AllDomains />} />} />
                        <Route path="/feeds/newly-registered" element={<ProtectedRoute element={<NewlyRegistered />} />} />
                    </Routes>
                </main>
            </div>
        </ThemeProvider>
    );
}

export default App;
