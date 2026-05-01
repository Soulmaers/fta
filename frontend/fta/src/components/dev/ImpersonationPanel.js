import React, { useState, useEffect } from "react";
import { getUsers, impersonateUser } from "../../api/auth";
import { useAuth } from "../../context/AuthProvider";

export default function ImpersonationPanel() {
    const { auth, impersonate, isImpersonating, stopImpersonating } = useAuth();
    const [users, setUsers] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    // Показываем только если роль DEVELOPER или мы уже в режиме имперсонации
    if (auth?.role !== 'DEVELOPER' && !isImpersonating) return null;

    const loadUsers = async () => {
        try {
            const data = await getUsers();
            // Не показываем в списке самого себя
            setUsers(data.filter(u => u.id !== auth?.id));
            setIsOpen(true);
        } catch (e) {
            alert("Ошибка загрузки пользователей");
        }
    };

    const handleImpersonate = async (user) => {
        try {
            const result = await impersonateUser(user.id);
            impersonate(result);
            setIsOpen(false);
            window.location.reload(); // Перезагружаем, чтобы сбросить кэш всех сущностей
        } catch (e) {
            alert("Ошибка входа под пользователем");
        }
    };

    return (
        <>
            {/* Плавающая кнопка для разработчика */}
            <button 
                onClick={loadUsers}
                style={{
                    position: 'fixed',
                    bottom: '80px',
                    right: '20px',
                    zIndex: 1000,
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                    fontSize: '24px',
                    cursor: 'pointer'
                }}
                title="Режим разработчика"
            >
                👤
            </button>

            {/* Модалка со списком */}
            {isOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div style={{
                        backgroundColor: '#1a1a1a',
                        color: 'white',
                        padding: '20px',
                        borderRadius: '15px',
                        width: '100%',
                        maxWidth: '400px',
                        maxHeight: '80vh',
                        overflowY: 'auto'
                    }}>
                        <h3>Выбрать пользователя:</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {users.map(u => (
                                <button 
                                    key={u.id}
                                    onClick={() => handleImpersonate(u)}
                                    style={{
                                        padding: '12px',
                                        backgroundColor: '#333',
                                        color: 'white',
                                        border: '1px solid #444',
                                        borderRadius: '8px',
                                        textAlign: 'left',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <strong>{u.login}</strong> ({u.role})
                                </button>
                            ))}
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)}
                            style={{
                                marginTop: '20px',
                                width: '100%',
                                padding: '10px',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px'
                            }}
                        >
                            Закрыть
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
