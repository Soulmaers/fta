import React from "react";
import { useNavigate } from "react-router-dom";
import LoginCard from "./LoginCard";

export default function AuthHome() {
    const nav = useNavigate();

    return (
        <LoginCard
            onSubmit={() => nav("/auth/singIn")}
            onForgot={() => nav("/auth/reset")}
            onRegister={() => nav("/auth/register")}
        />
    );
}
