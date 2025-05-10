import { ServerResponse } from "http";

export const handleError = (
  code: number,
  message: string,
  resp: ServerResponse
) => {
  resp.writeHead(code, message, { "content-type": "text/plain" }).end(message);
};
