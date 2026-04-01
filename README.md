# @mypdfcv/mcp-server

MCP (Model Context Protocol) server for generating professional resume PDFs. Works with Claude Desktop, Cursor, Windsurf, and any MCP-compatible client.

Built on top of [@mypdfcv/pdf-core](https://www.npmjs.com/package/@mypdfcv/pdf-core) and [@mypdfcv/i18n](https://www.npmjs.com/package/@mypdfcv/i18n).

## Features

- Generate professional resume PDFs from structured data
- Tailor resumes for specific job descriptions
- Custom section ordering
- Full JSON input mode for power users
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
- `sectionOrder` — Custom section order, e.g. `["skills", "experience", "education"]`
- `outputPath` — Where to save the PDF (default: `~/Downloads/<name>-resume.pdf`)

**Date format:** All dates use `"YYYY-MM"` format. Use `null` for `endDate` to indicate "Present".

### `generate_resume_from_json`

Power-user tool that accepts a full Resume JSON data object directly. Useful when you want complete control over the resume structure, including template config, section visibility, and ordering.

**Input:**
- `data` — Full resume data object (`fullName`, `headline`, `summary`, `contact`, `experience`, `education`, `skillGroups`, `projects`, `sections`, `sectionOrder`)
- `templateId` — Template to use (default: `"modern"`)
- `locale` — Language for section headers (default: `"en"`)
- `outputPath` — Where to save the PDF

### `tailor_resume_for_job`

Analyzes a job description against your current resume data and returns tailoring recommendations. The AI assistant then uses these to generate an optimized resume via `generate_resume_pdf`.

**Required:**
- `jobDescription` — The full job posting text
- `fullName` — Full name of the person

**Optional:**
- All resume fields (`headline`, `summary`, `experience`, `education`, `skillGroups`, `projects`)
- `additionalContext` — Extra info about the person not in the resume

## Examples

### Basic resume

> "Generate a resume PDF for John Doe, a senior software engineer at Acme Corp since 2020, with skills in TypeScript and Python. Use the classic template in Portuguese."

### Complete resume with all sections

> "Create a resume for Sarah Chen, a Product Manager at Google since 2021-03 (current). Before that she was an Associate PM at Meta from 2018-06 to 2021-02.
>
> Contact: sarah@email.com, San Francisco CA, linkedin.com/in/sarahchen.
>
> Education: MBA from Stanford (2016-09 to 2018-05), BS Computer Science from MIT (2012-09 to 2016-05, GPA 3.9).
>
> Skills: Product Strategy, A/B Testing, SQL, Python in 'Technical'. Stakeholder Management, Cross-functional Leadership, Agile/Scrum in 'Leadership'.
>
> Use the executive template, put skills before experience, and generate in English."

### Custom section order for a career changer

> "Generate a resume for Alex Torres, transitioning from teaching to UX design. Put skills first, then projects, then education, then experience. Use the minimal template.
>
> Skills: Figma, User Research, Wireframing, Prototyping (Design); HTML, CSS, JavaScript (Technical).
>
> Projects: 'Banking App Redesign' — Redesigned onboarding flow, reducing drop-off by 35%. Tech: Figma, UserTesting. 'Portfolio Website' — Built a responsive portfolio. Tech: React, Tailwind CSS.
>
> Education: UX Design Certificate from Google (2024-01 to 2024-06). BA English from UCLA (2015-09 to 2019-05).
>
> Experience: English Teacher at Lincoln High School from 2019-08 to 2023-12."

### Tailor for a specific job

> "Here's a job posting:
>
> **Senior Backend Engineer — Stripe**
> We're looking for a senior backend engineer to work on payments infrastructure. Requirements: 5+ years backend experience, strong in Go or Java, distributed systems, PostgreSQL, Kafka. Nice to have: fintech experience, Kubernetes, observability tools.
>
> My info: Maria Lopez, backend engineer at Shopify since 2020 (Go, PostgreSQL, Redis, Kubernetes). Before that at a fintech startup (2017-2019) building payment APIs with Java and Kafka. BS CS from University of Toronto.
>
> Tailor my resume for this Stripe role and generate the PDF with the modern template."

### Full JSON input

> "Generate a resume PDF from this JSON using the bold template in Spanish:"

```json
{
  "templateId": "bold",
  "locale": "es",
  "data": {
    "fullName": "Carlos Rivera",
    "headline": "Full Stack Developer",
    "summary": "5+ years building web apps with React and Node.js",
    "contact": {
      "email": "carlos@email.com",
      "location": "Madrid, Spain",
      "linkedin": "linkedin.com/in/carlosrivera"
    },
    "experience": [
      {
        "company": "Spotify",
        "title": "Senior Developer",
        "location": "Remote",
        "startDate": "2022-01",
        "endDate": null,
        "description": "Led migration to microservices\nBuilt analytics dashboard processing 1M+ events/day\nMentored 3 junior developers"
      },
      {
        "company": "Freelance",
        "title": "Web Developer",
        "startDate": "2019-06",
        "endDate": "2021-12",
        "description": "Delivered 20+ projects for clients across Europe\nBuilt e-commerce platforms with Stripe integration"
      }
    ],
    "education": [
      {
        "school": "Universidad Politecnica de Madrid",
        "degree": "B.S.",
        "field": "Computer Engineering",
        "startDate": "2015-09",
        "endDate": "2019-05"
      }
    ],
    "skillGroups": [
      { "category": "Frontend", "skills": ["React", "TypeScript", "Next.js", "Tailwind"] },
      { "category": "Backend", "skills": ["Node.js", "PostgreSQL", "Redis", "Docker"] }
    ],
    "sectionOrder": ["summary", "skills", "experience", "education"]
  }
}
```

## Programmatic Usage

The underlying packages can be used directly in Node.js without the MCP server:

```typescript
import { type Resume, createEmptyResumeData, generateId } from "@mypdfcv/pdf-core";
import { generateResumePDF } from "@mypdfcv/pdf-core/server";
import { getMessages } from "@mypdfcv/i18n/server";
import { writeFile } from "node:fs/promises";

const resume: Resume = {
  id: generateId(),
  name: "My Resume",
  templateId: "modern",
  status: "complete",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  exportCount: 0,
  data: {
    ...createEmptyResumeData(),
    fullName: "John Doe",
    headline: "Software Engineer",
    summary: "Full-stack engineer with 5+ years of experience.",
    contact: {
      email: "john@example.com",
      phone: "+1 555-0123",
      location: "San Francisco, CA",
      linkedin: "linkedin.com/in/johndoe",
      website: "johndoe.dev",
    },
    experience: [
      {
        id: generateId(),
        company: "Acme Corp",
        title: "Senior Engineer",
        location: "San Francisco, CA",
        startDate: "2020-01",
        endDate: null,
        current: true,
        description: "Led team of 5 engineers\nBuilt microservices serving 10M requests/day",
      },
    ],
    skillGroups: [
      { id: generateId(), category: "Languages", skills: ["TypeScript", "Python", "Go"] },
    ],
    education: [],
    projects: [],
    sections: { summary: true, experience: true, education: false, skills: true, projects: false },
    sectionOrder: ["summary", "skills", "experience"],
  },
};

const buffer = await generateResumePDF(resume, "en", getMessages("en"));
await writeFile("resume.pdf", buffer);
```

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
