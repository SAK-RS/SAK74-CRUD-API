import type { OutgoingHttpHeaders, ServerResponse } from "node:http";

export const setResponse = ({
  code,
  body,
  headers,
  resp,
}: {
  code: number;
  body?: string;
  headers?: OutgoingHttpHeaders;
  resp: ServerResponse;
}) => {
  resp.writeHead(code, headers).end(body);
};
