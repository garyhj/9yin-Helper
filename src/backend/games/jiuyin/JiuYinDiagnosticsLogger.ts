import { app } from 'electron';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '../../utils/Logger.ts';

type DiagnosticLevel = 'info' | 'warn' | 'error';

interface DiagnosticEntry {
    timestamp: string;
    level: DiagnosticLevel;
    event: string;
    details?: Record<string, unknown>;
    error?: {
        name: string;
        message: string;
        stack?: string;
    };
}

const toErrorPayload = (error: unknown): DiagnosticEntry['error'] => {
    if (error instanceof Error) {
        return {
            name: error.name,
            message: error.message,
            stack: error.stack,
        };
    }

    return {
        name: 'UnknownError',
        message: String(error),
    };
};

export class JiuYinDiagnosticsLogger {
    public getLogDirectory(): string {
        return this.getLogDir();
    }

    private getLogDir(): string {
        return path.join(app.getPath('userData'), 'logs', 'jiuyin');
    }

    private getLogFilePath(): string {
        const date = new Date().toISOString().slice(0, 10);
        return path.join(this.getLogDir(), `diagnostics-${date}.jsonl`);
    }

    public info(event: string, details?: Record<string, unknown>): void {
        this.write({ timestamp: new Date().toISOString(), level: 'info', event, details });
    }

    public warn(event: string, details?: Record<string, unknown>): void {
        this.write({ timestamp: new Date().toISOString(), level: 'warn', event, details });
    }

    public error(event: string, error: unknown, details?: Record<string, unknown>): void {
        this.write({
            timestamp: new Date().toISOString(),
            level: 'error',
            event,
            details,
            error: toErrorPayload(error),
        });
    }

    private write(entry: DiagnosticEntry): void {
        const summary = `[九阴诊断] ${entry.event}${entry.details ? ` ${JSON.stringify(entry.details)}` : ''}`;
        if (entry.level === 'error') {
            logger.error(`${summary} ${entry.error?.message ?? ''}`);
        } else if (entry.level === 'warn') {
            logger.warn(summary);
        } else {
            logger.info(summary);
        }

        void this.appendToFile(entry);
    }

    private async appendToFile(entry: DiagnosticEntry): Promise<void> {
        try {
            await fs.mkdir(this.getLogDir(), { recursive: true });
            await fs.appendFile(this.getLogFilePath(), `${JSON.stringify(entry)}\n`, 'utf-8');
        } catch (error) {
            console.error('[JiuYinDiagnosticsLogger] failed to write diagnostics log', error);
        }
    }
}

export const jiuYinDiagnosticsLogger = new JiuYinDiagnosticsLogger();
