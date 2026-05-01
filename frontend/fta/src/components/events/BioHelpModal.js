import React from "react";
import { FaTimes } from "react-icons/fa";
import { BIO_INFO } from "./constants";

export default function BioHelpModal({ showHelpModal, setShowHelpModal }) {
    if (!showHelpModal) return null;

    return (
        <div
            style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)',
                zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '24px'
            }}
            onClick={() => setShowHelpModal(null)}
        >
            <div
                style={{
                    width: '100%', maxWidth: '400px', background: 'rgba(30,30,30,0.95)',
                    borderRadius: '24px', padding: '24px', border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)', overflowY: 'auto', maxHeight: '90%'
                }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '15px', color: '#8bc34a', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{BIO_INFO[showHelpModal].title}</h3>
                    <FaTimes style={{ cursor: 'pointer', opacity: 0.6 }} onClick={() => setShowHelpModal(null)} size={18} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {BIO_INFO[showHelpModal].sections.map((section, sIdx) => (
                        <React.Fragment key={sIdx}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ fontSize: '12px', color: '#8bc34a', fontWeight: 'bold' }}>{section.title}:</div>
                                {section.items.map((text, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                        <div style={{ minWidth: '18px', height: '18px', borderRadius: '50%', background: 'rgba(139,195,74,0.15)', color: '#8bc34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>{idx + 1}</div>
                                        <div style={{ fontSize: '11px', lineHeight: '1.4', opacity: 0.8 }}>{text}</div>
                                    </div>
                                ))}
                            </div>
                            {sIdx === 0 && BIO_INFO[showHelpModal].image && (
                                <div style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', background: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <img src={BIO_INFO[showHelpModal].image} alt="Step" style={{ width: '100%', display: 'block' }} />
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
}