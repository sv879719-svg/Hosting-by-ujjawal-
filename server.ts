import express from "express";
import path from "path";
import multer from "multer";
import { createServer as createViteServer } from "vite";
import { spawn } from "child_process";

// Storage setup for user files
const upload = multer({ dest: "uploads/" });

async function startServer() {
  const app = express();
  const PORT = 3000;

  const activeProcesses = new Map<number, { process: any, name: string, password: string }>();
  const processLogs = new Map<number, string[]>();

// Real Deployment API
  app.post("/api/deploy", upload.single("appFile"), (req, res) => {
    const file = (req as any).file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const appType = req.body.appType; // 'python', 'node', etc.
    const botName = req.body.name || "Unnamed Bot";
    const password = req.body.password || "";
    const filePath = path.join(process.cwd(), file.path);

    console.log(`Physically executing: ${file.originalname} as ${appType} named ${botName}`);

    let processRunner: any;

    if (appType === 'python') {
      processRunner = spawn('python3', [filePath]);
    } else if (appType === 'node') {
      processRunner = spawn('node', [filePath]);
    } else {
      return res.status(400).json({ error: "Unsupported app type" });
    }
    
    activeProcesses.set(processRunner.pid!, { process: processRunner, name: botName, password });
    processLogs.set(processRunner.pid!, []);

    processRunner.stdout.on('data', (data: any) => {
        const logs = processLogs.get(processRunner.pid!) || [];
        logs.push(data.toString());
        console.log(`[Bot Output]: ${data}`);
    });
    processRunner.stderr.on('data', (data: any) => {
        const logs = processLogs.get(processRunner.pid!) || [];
        logs.push(`[Bot Error]: ${data}`);
        console.error(`[Bot Error]: ${data}`);
    });
    
    processRunner.on('close', (code: any) => {
        console.log(`Process exited with code ${code}`);
        activeProcesses.delete(processRunner.pid!);
        // Do not delete logs so user can see exit status
    });

    res.json({ message: `Deployment started. Running with PID: ${processRunner.pid}`, pid: processRunner.pid });
  });
  
  app.post("/api/verify-password", express.json(), (req, res) => {
      const { pid, password } = req.body;
      const processEntry = activeProcesses.get(pid);
      if (processEntry) {
          if (processEntry.password === password) {
              return res.json({ success: true });
          } else {
              return res.status(401).json({ success: false, error: "Incorrect password" });
          }
      }
      res.status(404).json({ error: "Process not found" });
  });

  app.post("/api/stop", express.json(), (req, res) => {
      const { pid } = req.body;
      const processEntry = activeProcesses.get(pid);
      if (processEntry) {
          processEntry.process.kill();
          activeProcesses.delete(pid);
          return res.json({ message: `Process ${pid} stopped` });
      }
      res.status(404).json({ error: "Process not found" });
  });

  app.get("/api/processes", (req, res) => {
      res.json(Array.from(activeProcesses.entries()).map(([pid, entry]) => ({ pid, name: entry.name })));
  });

  app.get("/api/logs/:pid", (req, res) => {
      const pid = parseInt(req.params.pid);
      const logs = processLogs.get(pid) || [];
      res.json(logs);
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Nebula Cloud running on http://localhost:${PORT}`);
  });
}

startServer();
