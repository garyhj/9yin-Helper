import { type CSSProperties, useState } from 'react';

export const OverlayApp = () => {
    const [closeHover, setCloseHover] = useState(false);

    const handleClose = () => {
        (window as any).ipcRenderer?.invoke('overlay-close');
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <span style={styles.headerText}>九阴助手</span>
                <button
                    style={{
                        ...styles.closeButton,
                        ...(closeHover ? styles.closeButtonHover : {}),
                    }}
                    onClick={handleClose}
                    onMouseEnter={() => setCloseHover(true)}
                    onMouseLeave={() => setCloseHover(false)}
                    title="关闭浮窗"
                    type="button"
                >
                    X
                </button>
            </div>

            <div style={styles.body}>
                <div style={styles.badge}>Phase 0</div>
                <h1 style={styles.title}>浮窗尚未启用</h1>
                <p style={styles.text}>
                    当前项目已切换为九阴专用。浮窗会在窗口识别、截图区域和输入验证完成后重新设计。
                </p>
            </div>
        </div>
    );
};

const styles: Record<string, CSSProperties> = {
    container: {
        width: '100%',
        height: '100%',
        background: 'linear-gradient(180deg, rgba(20, 31, 43, 0.95), rgba(33, 44, 54, 0.92))',
        color: '#e8f2f7',
        fontFamily: 'Microsoft YaHei, "Segoe UI", sans-serif',
        fontSize: '12px',
        display: 'flex',
        flexDirection: 'column',
        borderLeft: '1px solid rgba(102, 204, 255, 0.35)',
        overflow: 'hidden',
        userSelect: 'none',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 12px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    },
    headerText: {
        fontSize: '13px',
        fontWeight: 700,
        color: '#66ccff',
        letterSpacing: '0.5px',
    },
    closeButton: {
        color: '#94a3b8',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: '2px 5px',
        borderRadius: '4px',
        lineHeight: 1,
    },
    closeButtonHover: {
        color: '#ffffff',
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
    },
    body: {
        padding: '16px 12px',
    },
    badge: {
        display: 'inline-block',
        padding: '3px 7px',
        borderRadius: '999px',
        backgroundColor: 'rgba(245, 158, 11, 0.16)',
        color: '#fbbf24',
        fontWeight: 700,
        marginBottom: '10px',
    },
    title: {
        margin: 0,
        fontSize: '15px',
        color: '#f8fafc',
    },
    text: {
        margin: '8px 0 0',
        color: '#cbd5e1',
        lineHeight: 1.6,
    },
};
