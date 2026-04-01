import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { listTemplates } from "./tools/list-templates.js";
import { listLocales } from "./tools/list-locales.js";
import { generateResumeSchema, generateResume } from "./tools/generate-resume.js";

const server = new McpServer({
  name: "mypdfcv",
  version: "1.0.1",
});

server.tool(
  "list_templates",
  "List all available resume templates with their styles and descriptions",
  {},
  async () => listTemplates(),
);

server.tool(
  "list_locales",
  "List all supported languages for resume PDF generation",
  {},
  async () => listLocales(),
);

server.tool(
  "generate_resume_pdf",
  "Generate a professional resume PDF from structured data. Returns the file path of the saved PDF.",
  generateResumeSchema.shape,
  async (input) => generateResume(input),
);

const transport = new StdioServerTransport();
await server.connect(transport);
