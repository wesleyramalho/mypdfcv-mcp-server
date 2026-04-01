import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { listTemplates } from "./tools/list-templates.js";
import { listLocales } from "./tools/list-locales.js";
import { generateResumeSchema, generateResume } from "./tools/generate-resume.js";
import { generateFromJsonSchema, generateFromJson } from "./tools/generate-from-json.js";
import { tailorResumeSchema, tailorResume } from "./tools/tailor-resume.js";

const server = new McpServer({
  name: "mypdfcv",
  version: "1.1.0",
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
  "Generate a professional resume PDF from structured data. Supports custom section ordering. Returns the file path of the saved PDF.",
  generateResumeSchema.shape,
  async (input) => generateResume(input),
);

server.tool(
  "generate_resume_from_json",
  "Generate a resume PDF from a full Resume JSON data object. Power-user tool for passing complete, pre-built resume structures including template config and section order.",
  generateFromJsonSchema.shape,
  async (input) => generateFromJson(input),
);

server.tool(
  "tailor_resume_for_job",
  "Analyze a job description against current resume data and return tailoring recommendations. Use this before generate_resume_pdf to optimize a resume for a specific position.",
  tailorResumeSchema.shape,
  async (input) => tailorResume(input),
);

const transport = new StdioServerTransport();
await server.connect(transport);
