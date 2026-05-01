import React from "react";
import styles from "./Card.module.css";

export default function Card({ title, description, children }) {
    return (
        <div className={`${styles.card} minw0`}>
            <div className={`${styles.title} break-anywhere`}>{title}</div>
            {description ? (
                <div className={`${styles.desc} break-anywhere`}>{description}</div>
            ) : null}
            {children ? <div className={styles.body}>{children}</div> : null}
        </div>
    );
}
