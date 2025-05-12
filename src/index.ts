import { server } from "./server";
import { PORT } from "../_setup";
import { parseArgs } from "node:util";
import cluster from "node:cluster";
import { availableParallelism } from "node:os";
import { createServer } from "node:http";
import { request, type RequestOptions } from "node:http";

const {
  values: { multi },
} = parseArgs({
  options: {
    multi: { type: "boolean" },
  },
});

if (!multi) {
  start();
} else {
  if (cluster.isPrimary) {
    const workerPorts: number[] = [];
    for (let i = 0; i < availableParallelism() - 1; i += 1) {
      const workerPort = PORT + i + 1;
      cluster.fork({ WORKER_PORT: workerPort });
      workerPorts.push(workerPort);
    }

    let currentIndex = 0;
    const lbServer = createServer((req, res) => {
      const targetPort = workerPorts[currentIndex];
      currentIndex = (currentIndex + 1) % workerPorts.length;
      const options: RequestOptions = {
        hostname: "localhost",
        port: targetPort,
        path: req.url,
        method: req.method,
        headers: req.headers,
      };
      const proxy = request(options, (proxyResp) => {
        res.writeHead(proxyResp.statusCode ?? 500, proxyResp.headers);
        proxyResp.pipe(res);
      });
      proxy.on("error", () => {
        res
          .writeHead(500)
          .end(`Error connecting to worker on port ${targetPort}`);
      });
      req.pipe(proxy);
    });

    lbServer.listen(PORT, () => {
      console.log(`Load balancer is running on port ${PORT}`);
    });
  } else {
    const workerPort = process.env.WORKER_PORT
      ? Number(process.env.WORKER_PORT)
      : PORT;

    start(workerPort);
  }
}

function start(port: number = PORT) {
  try {
    server.listen(port, () => {
      console.log(`Worker ${process.pid} runs Server on port ${port}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}
