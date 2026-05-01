import { useEffect, useState } from "react";
import styles from "./OrientationGuard.module.css";

function isPortrait() {
    if (window.screen?.orientation?.type) {
        return window.screen.orientation.type.startsWith("portrait");
    }

    // fallback
    return window.innerHeight >= window.innerWidth;
}

export default function OrientationGuard({ children }) {
    const [portrait, setPortrait] = useState(isPortrait());

    useEffect(() => {
        const handler = () => setPortrait(isPortrait());

        window.addEventListener("resize", handler);
        window.addEventListener("orientationchange", handler);

        return () => {
            window.removeEventListener("resize", handler);
            window.removeEventListener("orientationchange", handler);
        };
    }, []);

    if (!portrait) {
        return (
            <div className={styles.blocker}>
                <div className={styles.card}>
                    <div className={styles.icon}>📱↻</div>
                    <h1 className={styles.title}>Поверните устройство</h1>
                    <p className={styles.text}>
                        Приложение работает только в вертикальной ориентации
                    </p>
                </div>
            </div>
        );
    }

    return children;
}
