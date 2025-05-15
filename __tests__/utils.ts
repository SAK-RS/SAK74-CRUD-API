import { IncomingHttpHeaders, IncomingMessage, request } from "node:http";
import { PORT } from "../_setup";

export const makeRequest: (params: {
  hostname?: string;
  port?: number;
  path: string;
  method: string;
  headers?: Record<string, string>;
  body?: string;
}) => Promise<{
  status?: number;
  headers: IncomingHttpHeaders;
  body: string;
}> = ({ hostname = "localhost", port = PORT, path, method, headers, body }) =>
  new Promise((resolve, reject) => {
    const reqInstance = request(
      { hostname, port, path, method, headers },
      (res: IncomingMessage) => {
        let chunks: string[] = [];
        res.on("data", (chunk: any) => chunks.push(chunk));
        res.on("end", () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: chunks.join(""),
          });
        });
      }
    );
    reqInstance.on("error", reject);
    if (body) {
      reqInstance.write(body);
    }
    reqInstance.end();
  });
