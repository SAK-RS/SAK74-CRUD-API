import { createServer } from "node:http";
import { serverListener } from "./server";

const PORT = process.env.PORT || 3000;

try {
  const server = createServer(serverListener);
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
} catch (error) {
  console.error("Error starting server:", error);
  process.exit(1);
}
