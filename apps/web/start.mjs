import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const port = process.env.PORT ?? "3000";
const nextCli = path.join(root, "node_modules", "next", "dist", "bin", "next");

const child = spawn(process.execPath, [nextCli, "start", "-H", "0.0.0.0", "-p", port], {
  stdio: "inherit",
  cwd: root,
  env: process.env
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
