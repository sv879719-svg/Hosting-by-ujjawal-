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

  const activeProcesses = new Map<number, any>();

// Real Deployment API
  app.post("/api/deploy", upload.single("appFile"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const appType = req.body.appType; // 'python', 'node', etc.
    const filePath = path.join(process.cwd(), req.file.path);

    console.log(`Physically executing: ${req.file.originalname} as ${appType}`);

    let processRunner: any;

    if (appType === 'python') {
      processRunner = spawn('python3', [filePath]);
    } else if (appType === 'node') {
      processRunner = spawn('node', [filePath]);
    } else {
      return res.status(400).json({ error: "Unsupported app type" });
    }
    
    activeProcesses.set(processRunner.pid!, processRunner);

    processRunner.stdout.on('data', (data: any) => console.log(`[Bot Output]: ${data}`));
    processRunner.stderr.on('data', (data: any) => console.error(`[Bot Error]: ${data}`));
    
    processRunner.on('close', (code: any) => {
        console.log(`Process exited with code ${code}`);
        activeProcesses.delete(processRunner.pid!);
    });

    res.json({ message: `Deployment started. Running with PID: ${processRunner.pid}`, pid: processRunner.pid });
  });
  
  app.post("/api/stop", express.json(), (req, res) => {
      const { pid } = req.body;
      const process = activeProcesses.get(pid);
      if (process) {
          process.kill();
          activeProcesses.delete(pid);
          return res.json({ message: `Process ${pid} stopped` });
      }
      res.status(404).json({ error: "Process not found" });
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
