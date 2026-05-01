import React from "react";
import styles from "./Button.module.css";

export default function Button({ children, ...props }) {
    return (
        <button className={styles.btn} type="button" {...props}>
            {children}
        </button>
    );
}
