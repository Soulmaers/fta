import React, { useState, useRef } from "react";
import styles from "./PlayerImport.module.css";
import { useNavigate } from "react-router-dom";
import { useTeams } from "../../../context/EntityContext";
import { useAuth } from "../../../context/AuthProvider";
import { FaFileImport, FaDownload } from "react-icons/fa";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export default function PlayerImport() {
    const nav = useNavigate();
    const { auth } = useAuth();
    const { create, data, load } = useTeams();
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    React.useEffect(() => {
        if (auth?.id) {
            load('players', auth.id);
        }
    }, [auth?.id, load]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const downloadTemplate = async () => {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Игроки");

        // 1. Columns structure
        sheet.columns = [
            { header: "ФИО", key: "fullName", width: 30 },
            { header: "Дата рождения", key: "birthDate", width: 15 },
            { header: "Позиция", key: "position", width: 15 },
            { header: "Ведущая нога", key: "leg", width: 15 },
            { header: "Номер", key: "number", width: 10 },
            { header: "Вес", key: "weight", width: 10 },
            { header: "Рост", key: "height", width: 10 },
        ];

        // 2. Styling header
        sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
        sheet.getRow(1).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF2E7D32" } // Football Green
        };

        // 3. Add example row
        sheet.addRow({
            fullName: "Иванов Иван Иванович",
            birthDate: "01.01.2005",
            position: "FW",
            leg: "Правая",
            number: 10,
            weight: 75,
            height: 185
        });

        // 4. Data Validation (Dropdowns) for 100 rows
        const positions = ["GK", "DF", "MF", "FW"];
        const legs = ["Правая", "Левая", "Обе"];

        for (let i = 2; i <= 100; i++) {
            // Position col (C)
            sheet.getCell(`C${i}`).dataValidation = {
                type: "list",
                allowBlank: true,
                formulae: [`"${positions.join(",")}"`]
            };
            // Leg col (D)
            sheet.getCell(`D${i}`).dataValidation = {
                type: "list",
                allowBlank: true,
                formulae: [`"${legs.join(",")}"`]
            };
        }

        // 5. Generate and download
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), "шаблон_игроков.xlsx");
    };

    const handleUpload = async () => {
        if (!file || !auth?.id) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                setLoading(true);
                const dataArray = evt.target.result;
                const wb = XLSX.read(dataArray, { type: "array" });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const rows = XLSX.utils.sheet_to_json(ws);

                if (rows.length === 0) {
                    alert("Файл пуст");
                    setLoading(false);
                    return;
                }

                // ВАЖНО: Запрашиваем самый свежий список игроков из БД перед проверкой
                const freshPlayers = await load('players', auth.id);

                const skipped = {
                    noName: 0,
                    noDate: 0,
                    duplicate: 0
                };

                const processedRows = rows.map((row, index) => {
                    const fullName = row["ФИО"] || row["Имя"] || row["FullName"];
                    if (!fullName) {
                        skipped.noName++;
                        return null;
                    }

                    let birthDateValue = row["Дата рождения"] || row["Birthday"];
                    let formattedBirthDate = null;

                    if (birthDateValue) {
                        try {
                            if (typeof birthDateValue === "number") {
                                const date = new Date((birthDateValue - (25567 + 1)) * 86400 * 1000);
                                formattedBirthDate = date.toISOString().split("T")[0];
                            }
                            else if (typeof birthDateValue === "string") {
                                const trimmedDate = String(birthDateValue).trim();
                                const parts = trimmedDate.split(/[.\-/]/);
                                if (parts.length === 3) {
                                    if (parts[2].length === 4) {
                                        formattedBirthDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                                    } else if (parts[0].length === 4) {
                                        formattedBirthDate = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
                                    }
                                } else {
                                    formattedBirthDate = trimmedDate;
                                }
                            }
                        } catch (e) {
                            console.warn("Date parse error", e);
                        }
                    }

                    // Обязательные поля: ФИО и Дата Рождения
                    if (!formattedBirthDate) {
                        skipped.noDate++;
                        return null;
                    }

                    // Mapping for Position
                    const rawPos = String(row["Позиция"] || "").trim().toUpperCase();
                    let position = null;
                    if (["GK", "ВРАТАРЬ"].includes(rawPos)) position = "GK";
                    else if (["DF", "ЗАЩИТНИК"].includes(rawPos)) position = "DF";
                    else if (["MF", "ПОЛУЗАЩИТНИК"].includes(rawPos)) position = "MF";
                    else if (["FW", "НАПАДАЮЩИЙ"].includes(rawPos)) position = "FW";

                    // Mapping for Leg
                    const rawLeg = String(row["Ведущая нога"] || "").trim().toLowerCase();
                    let leg = null;
                    if (["right", "правая"].includes(rawLeg)) leg = "right";
                    else if (["left", "левая"].includes(rawLeg)) leg = "left";
                    else if (["any", "обе"].includes(rawLeg)) leg = "any";

                    // Дубликаты: сравниваем данные из Excel со свежим списком из базы
                    const alreadyExists = (freshPlayers || []).some(existing => {
                        const sameName = existing.fullName?.toLowerCase().trim() === String(fullName).toLowerCase().trim();
                        const existingDate = existing.birthDate ? String(existing.birthDate).split('T')[0] : null;
                        const sameDate = existingDate === formattedBirthDate;
                        return sameName && sameDate;
                    });

                    if (alreadyExists) {
                        skipped.duplicate++;
                        return null;
                    }

                    return {
                        fullName: String(fullName).trim(),
                        birthDate: formattedBirthDate,
                        position,
                        leg,
                        number: row["Номер"] ? Number(row["Номер"]) : null,
                        weight: row["Вес"] ? Number(row["Вес"]) : null,
                        height: row["Рост"] ? Number(row["Рост"]) : null,
                    };
                }).filter(p => p !== null);

                if (processedRows.length === 0) {
                    let msg = "Нет данных для загрузки.\n\nПричины пропуска:";
                    if (skipped.noName > 0) msg += `\n- Без имени: ${skipped.noName}`;
                    if (skipped.noDate > 0) msg += `\n- Без даты рождения: ${skipped.noDate}`;
                    if (skipped.duplicate > 0) msg += `\n- Уже есть в базе: ${skipped.duplicate}`;

                    alert(msg);
                    setLoading(false);
                    return;
                }

                const promises = processedRows.map(payload => create("players", auth.id, payload));
                const results = await Promise.all(promises);

                let successMsg = `Успешно создано игроков: ${results.length}`;
                const totalSkipped = skipped.noName + skipped.noDate + skipped.duplicate;
                if (totalSkipped > 0) {
                    successMsg += `\n\nПропущено строк: ${totalSkipped}`;
                    if (skipped.noName > 0) successMsg += `\n- Без имени: ${skipped.noName}`;
                    if (skipped.noDate > 0) successMsg += `\n- Без даты рождения: ${skipped.noDate}`;
                    if (skipped.duplicate > 0) successMsg += `\n- Дубликаты: ${skipped.duplicate}`;
                }

                alert(successMsg);
                nav("/config");
            } catch (err) {
                console.error("Excel import error:", err);
                alert("Ошибка при обработке файла: " + (err.message || "Неизвестная ошибка"));
            } finally {
                setLoading(false);
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        };
        reader.readAsArrayBuffer(file);
    };

    return (
        <div className={styles.screen}>
            <header className={styles.header}>
                <button className={styles.back} type="button" onClick={() => nav(-1)}>
                    <span className={styles.backArrow}>‹</span>
                    <span className={styles.backText}>Назад:</span>
                </button>
                <div className={styles.title}>Загрузить игроков</div>
                <div className={styles.headerSpacer} />
            </header>

            <main className={styles.content}>
                <div className={styles.card}>
                    <div className={styles.iconBox}>
                        <FaFileImport size={60} color="rgba(255,255,255,0.6)" />
                    </div>

                    <h2 className={styles.cardTitle}>Загрузить игроков</h2>
                    <p className={styles.cardDesc}>
                        Загрузите один файл в формате Excel (.xls; .xlsx)
                    </p>

                    <button
                        className={styles.templateBtn}
                        onClick={downloadTemplate}
                    >
                        <FaDownload size={14} /> Скачать шаблон
                    </button>

                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        accept=".xlsx, .xls"
                        onChange={handleFileChange}
                    />

                    <button
                        className={styles.selectBtn}
                        onClick={() => fileInputRef.current.click()}
                    >
                        {file ? `Выбрано: ${file.name}` : "Выбрать файл"}
                    </button>

                    <div className={styles.btnGroup}>
                        <button
                            className={styles.cancelBtn}
                            onClick={() => nav(-1)}
                        >
                            Отменить
                        </button>
                        <button
                            className={styles.uploadBtn}
                            disabled={!file || loading}
                            onClick={handleUpload}
                        >
                            {loading ? "Загрузка..." : "Загрузить"}
                        </button>
                    </div>
                </div>
            </main>

            {loading && (
                <div className={styles.overlay}>
                    <div className={styles.spinner} />
                    <p>Обработка списка...</p>
                </div>
            )}
        </div>
    );
}
