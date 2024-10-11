import fs from 'fs';
import path from 'path';
import { format } from 'date-fns';
import winston from 'winston';

class Logger {
  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
    this.sessionDir = path.join(this.logDir, `session_${this.timestamp}`);

    if (!fs.existsSync(this.sessionDir)) {
      fs.mkdirSync(this.sessionDir, { recursive: true });
    }

    this.appLogger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
          return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
        })
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: path.join(this.sessionDir, 'app.log') })
      ]
    });

    this.langchainLogger = winston.createLogger({
      level: 'debug',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
          return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
        })
      ),
      transports: [
        new winston.transports.File({ filename: path.join(this.sessionDir, 'langchain.log') })
      ]
    });
  }

  log(message, level = 'info') {
    this.appLogger[level](message);
  }

  error(message) {
    this.log(message, 'error');
  }

  warn(message) {
    this.log(message, 'warn');
  }

  info(message) {
    this.log(message, 'info');
  }

  langchainLog(message, level = 'info') {
    this.langchainLogger[level](message);
  }

  getSessionDir() {
    return this.sessionDir;
  }
}

export const logger = new Logger();
