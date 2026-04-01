# @mypdfcv/mcp-server

MCP (Model Context Protocol) server for generating professional resume PDFs. Works with Claude Desktop, Cursor, Windsurf, and any MCP-compatible client.

Built on top of [@mypdfcv/pdf-core](https://www.npmjs.com/package/@mypdfcv/pdf-core) and [@mypdfcv/i18n](https://www.npmjs.com/package/@mypdfcv/i18n).

## Features

- Generate professional resume PDFs from structured data
- 7 templates: modern, classic, minimal, executive, bold, balanced, clear
- 7 languages: English, Portuguese (BR), Spanish, Italian, Chinese, Japanese, German
- No Next.js or browser required — runs standalone in Node.js

## Setup

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mypdfcv": {
      "command": "npx",
      "args": ["-y", "@mypdfcv/mcp-server"]
    }
  }
}
```

### Cursor

Add to your MCP settings:

```json
{
  "mcpServers": {
    "mypdfcv": {
      "command": "npx",
      "args": ["-y", "@mypdfcv/mcp-server"]
    }
  }
}
```

### Claude Code

```bash
claude mcp add mypdfcv -- npx -y @mypdfcv/mcp-server
```

## Tools

### `list_templates`

Lists all available resume templates with their styles and descriptions.

### `list_locales`

Lists all supported languages for resume generation.

### `generate_resume_pdf`

Generates a PDF resume and saves it to disk.

**Required:**
- `fullName` — Full name of the person

**Optional:**
- `headline` — Professional headline (e.g. "Senior Software Engineer")
- `summary` — Professional summary paragraph
- `contact` — Object with `email`, `phone`, `location`, `linkedin`, `website`
- `experience` — Array of work entries (`company`, `title`, `startDate`, `description`, ...)
- `education` — Array of education entries (`school`, `degree`, `field`, `startDate`, ...)
- `skillGroups` — Array of skill groups (`category`, `skills[]`)
- `projects` — Array of project entries (`name`, `description`, `technologies[]`, ...)
- `templateId` — Template to use (default: `"modern"`)
- `locale` — Language for section headers (default: `"en"`)
- `outputPath` — Where to save the PDF (default: `~/Downloads/<name>-resume.pdf`)

**Date format:** All dates use `"YYYY-MM"` format. Use `null` for `endDate` to indicate "Present".

## Example Usage

Ask your AI assistant:

> "Generate a resume PDF for John Doe, a senior software engineer at Acme Corp since 2020, with skills in TypeScript and Python. Use the classic template in Portuguese."

## Development

```bash
# Install dependencies
npm install

# Link local @mypdfcv packages (if not published yet)
# First build them: cd ../resume-builder && npm run build:packages
# Then: cd ../resume-builder/packages/i18n && npm link
# Then: cd ../resume-builder/packages/pdf && npm link
# Then: cd ../mypdfcv-mcp-server && npm link @mypdfcv/pdf-core @mypdfcv/i18n

# Build
npm run build

# Test
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}' | node dist/index.js
```

## License

MIT
