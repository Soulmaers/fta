import React, { useState, useEffect } from "react";
import { getUsers, impersonateUser } from "../../api/auth";
import { useAuth } from "../../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../../api/entity";
import { useTeams } from "../../context/EntityContext";
import fieldImg from "../../assets/field.webp"; // Импортируем твои обои

export default function ImpersonationPage() {
    const { impersonate, logout } = useAuth();
    const { clearData } = useTeams();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const nav = useNavigate();

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getUsers();
                setUsers(data.filter(u => u.role !== 'DEVELOPER'));
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleImpersonate = async (user) => {
        try {
            const result = await impersonateUser(user.id);
            clearData();
            impersonate(result);
            
            if (user.role === 'MANAGER') {
                try {
                    const teams = await apiGet("teams", user.id);
                    if (teams && teams.length > 0) {
                        nav("/app");
                    } else {
                        nav("/config");
                    }
                } catch (err) {
                    nav("/config");
                }
            } else {
                nav("/app");
            }
        } catch (e) {
            alert("Ошибка входа");
        }
    };

    if (loading) return (
        <div style={{backgroundColor: '#0b1020', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'}}>
            Загрузка...
        </div>
    );

    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: '#0b1020',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontFamily: 'sans-serif'
        }}>
            {/* Layer с футбольным полем как в ConfigShell */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `
                    radial-gradient(120% 60% at 50% 0%, rgba(255, 255, 255, 0.10), transparent 62%),
                    linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.7)),
                    url(${fieldImg})
                `,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transform: 'scale(1.03)',
                zIndex: 0
            }} />

            {/* Контент поверх поля */}
            <div style={{
                position: 'relative',
                zIndex: 1,
                width: '100%',
                maxWidth: '430px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                padding: '40px 20px',
                boxSizing: 'border-box'
            }}>
                <div style={{
                    color: '#fff',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    textShadow: '0 2px 10px rgba(0,0,0,0.5)'
                }}>
                    Консоль разработчика
                </div>

                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <button 
                        onClick={async () => {
                            await logout();
                            nav("/auth/login");
                        }}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#fff',
                            fontSize: '13px',
                            padding: '6px 15px',
                            borderRadius: '20px',
                            cursor: 'pointer'
                        }}
                    >
                         Выйти из системы
                    </button>
                </div>

                {/* Скроллируемая область */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    paddingBottom: '30px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                }}>
                    {users.map(u => (
                        <div 
                            key={u.id}
                            onClick={() => handleImpersonate(u)}
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                backdropFilter: 'blur(15px)',
                                borderRadius: '16px',
                                padding: '16px 20px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div>
                                <div style={{ color: '#fff', fontSize: '18px', fontWeight: '500' }}>{u.login}</div>
                                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>{u.role}</div>
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '20px' }}>›</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
