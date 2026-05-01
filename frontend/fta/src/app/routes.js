import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import AuthShell from "../layouts/AuthShell";
import MobileShell from "../layouts/MobileShell";
import ConfigShell from '../layouts/ConfigShell'
import AuthHome from "../pages/auth/AuthHome";
import ConfigHome from "../pages/configurator/ConfigHome";
import MainHome from "../pages/main/MainHome";
import ProfilePage from "../pages/main/ProfilePage";
import EventPage from "../pages/main/EventPage";
import Register from "../pages/auth/Register";
import ResetPassword from "../pages/auth/ResetPassword";
import ChangePassword from "../pages/auth/ChangePassword";
import TeamCreate from '../pages/configurator/teams/TeamCreate'
import TeamEdit from '../pages/configurator/teams/TeamEdit'
import TeamsList from "../pages/configurator/teams/TeamsList";
import PersonalCreate from "../pages/configurator/personal/PersonalCreate";
import PersonalEdit from '../pages/configurator/personal/PersonalEdit'
import PersonalList from '../pages/configurator/personal/PersonalList'
import LineupCreate from "../pages/configurator/lineups/LineupCreate";
import LineupEdit from "../pages/configurator/lineups/LineupEdit";
import LineupList from "../pages/configurator/lineups/LineupList";
import PlayerCreate from "../pages/configurator/players/PlayerCreate";
import PlayerEdit from "../pages/configurator/players/PlayerEdit";
import PlayerList from "../pages/configurator/players/PlayerList";
import PlayerImport from "../pages/configurator/players/PlayerImport";
import TeamSelect from "../pages/configurator/TeamSelect";
import TeamAssign from "../pages/configurator/TeamAssign";
import { EntityProvider } from "../context/EntityContext";
import ImpersonationPage from "../pages/dev/ImpersonationPage";
import { useAuth } from "../context/AuthProvider";

export default function AppRoutes() {
    const { auth, isImpersonating } = useAuth();

    return (
        <Routes>
            <Route path="/" element={
                !auth?.id ? <Navigate to="/auth" replace /> : (
                    auth.role === 'DEVELOPER' && !isImpersonating 
                        ? <Navigate to="/dev/impersonate" replace /> 
                        : auth.role === 'MANAGER' 
                            ? <Navigate to="/config" replace /> 
                            : <Navigate to="/app" replace />
                )
            } />

            {/* 1) AUTH */}
            <Route element={<AuthShell />}>
                <Route path="/auth" element={<Navigate to="/auth/login" replace />} />
                <Route path="/auth/login" element={<AuthHome />} />
                <Route path="/auth/reset" element={<ResetPassword />} />
                <Route path="/auth/register" element={<Register />} />
                <Route path="/auth/change-password" element={<ChangePassword />} />
            </Route>

            {/* 2) CONFIGURATOR */}
            <Route element={<ConfigShell />}>
                <Route path="/config" element={<ConfigHome />} />
                <Route path="/config/teams/create" element={<TeamCreate />} />
                <Route path="/config/teams/edit" element={<TeamEdit />} />
                <Route path="/config/teams/list" element={<TeamsList />} />
                <Route path="/config/personal/create" element={<PersonalCreate />} />
                <Route path="/config/personal/edit" element={<PersonalEdit />} />
                <Route path="/config/personal/list" element={<PersonalList />} />
                <Route path="/config/lineups/list" element={<LineupList />} />
                <Route path="/config/lineups/create" element={<LineupCreate />} />
                <Route path="/config/lineups/edit" element={<LineupEdit />} />
                <Route path="/config/players/create" element={<PlayerCreate />} />
                <Route path="/config/players/edit" element={<PlayerEdit />} />
                <Route path="/config/players/list" element={<PlayerList />} />
                <Route path="/config/players/import" element={<PlayerImport />} />

                <Route path="/config/select-teams" element={<TeamSelect />} />
                <Route path="/config/assign-team/:teamId" element={<TeamAssign />} />
            </Route>

            {/* 3) MAIN APP */}
            <Route element={<MobileShell />}>
                <Route path="/app" element={
                    auth?.role === 'DEVELOPER' && !isImpersonating 
                        ? <Navigate to="/dev/impersonate" replace /> 
                        : <MainHome />
                } />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/app/event/:id" element={<EventPage />} />
            </Route>

            {/* 4) DEVELOPER */}
            <Route path="/dev/impersonate" element={<ImpersonationPage />} />

            <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
    );
}
