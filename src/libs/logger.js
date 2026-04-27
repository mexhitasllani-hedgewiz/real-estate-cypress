import fs from "fs";
import path from "path";

function timestamp() {
  return new Date().toISOString();
}

function getLogFile() {
  return process.env.LOG_FILE || path.resolve(process.cwd(), "logs/cypress-run.log");
}

function appendLog(message) {
  const logFile = getLogFile();
  fs.mkdirSync(path.dirname(logFile), { recursive: true });
  fs.appendFileSync(logFile, `[${timestamp()}] ${message}\n`);
}

export { appendLog };
