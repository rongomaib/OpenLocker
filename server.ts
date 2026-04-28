import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { SerialPort } from "serialport";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // RS485 Configuration
  const RS485_PORT = process.env.RS485_PORT || "/dev/ttyUSB0";
  const BAUD_RATE = parseInt(process.env.RS485_BAUD || "9600");

  let port: SerialPort | null = null;

  try {
    port = new SerialPort({
      path: RS485_PORT,
      baudRate: BAUD_RATE,
      autoOpen: false,
    });

    port.on("error", (err) => {
      console.error("RS485 Serial Port Error:", err.message);
    });

    console.log(`Attempting to use RS485 on ${RS485_PORT} at ${BAUD_RATE} baud`);
  } catch (e) {
    console.warn("Could not initialize SerialPort. Hardware features will be mocked.");
  }

  // API: Unlock Locker
  app.post("/api/locker/unlock", async (req, res) => {
    const { lockerId } = req.body;
    console.log(`[API] Unlocking locker ${lockerId}...`);

    if (port && port.isOpen) {
      // Example RS485 Protocol: [Header, LockerID, Command, Checksum]
      // Replace with your actual hardware protocol
      const command = Buffer.from([0xAA, lockerId, 0x01, 0x55]);
      port.write(command, (err) => {
        if (err) {
          return res.status(500).json({ error: "Failed to write to RS485" });
        }
        res.json({ success: true, lockerId, hardware: "RS485" });
      });
    } else {
      // Mock hardware for preview
      console.log(`[MOCK] RS485 command sent to locker ${lockerId}`);
      await new Promise(resolve => setTimeout(resolve, 500));
      res.json({ success: true, lockerId, hardware: "MOCK" });
    }
  });

  // API: Get Locker Status
  app.get("/api/locker/status", (req, res) => {
    // In a real app, you might poll RS485 for sensor data
    res.json({ status: "online", hardware: port ? "connected" : "mocked" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    if (port) {
      port.open((err) => {
        if (err) {
          console.warn(`Could not open ${RS485_PORT}. Is the USB adapter plugged in?`);
        } else {
          console.log(`RS485 Port ${RS485_PORT} opened successfully.`);
        }
      });
    }
  });
}

startServer();
