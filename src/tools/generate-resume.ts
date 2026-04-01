import { writeFile, mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, resolve } from "node:path";
import {
  type Resume,
  createEmptyResumeData,
  generateId,
} from "@mypdfcv/pdf-core";
import { generateResumePDF } from "@mypdfcv/pdf-core/server";
import { getMessages } from "@mypdfcv/i18n/server";
import { z } from "zod";

export const generateResumeSchema = z.object({
  fullName: z.string().describe("Full name of the person"),
  headline: z.string().optional().describe("Professional headline, e.g. 'Senior Software Engineer'"),
  summary: z.string().optional().describe("Professional summary paragraph"),
  contact: z
    .object({
      email: z.string().optional(),
      phone: z.string().optional(),
      location: z.string().optional(),
      linkedin: z.string().optional(),
      website: z.string().optional(),
    })
    .optional()
    .describe("Contact information"),
  experience: z
    .array(
      z.object({
        company: z.string(),
        title: z.string(),
        location: z.string().optional(),
        startDate: z.string().describe("Format: YYYY-MM"),
        endDate: z.string().nullable().optional().describe("Format: YYYY-MM or null for current"),
        current: z.boolean().optional(),
        description: z.string().describe("Use newlines to separate bullet points"),
      }),
    )
    .optional()
    .describe("Work experience entries"),
  education: z
    .array(
      z.object({
        school: z.string(),
        degree: z.string(),
        field: z.string(),
        startDate: z.string().describe("Format: YYYY-MM"),
        endDate: z.string().nullable().optional().describe("Format: YYYY-MM or null"),
        gpa: z.string().optional(),
        highlights: z.string().optional(),
      }),
    )
    .optional()
    .describe("Education entries"),
  skillGroups: z
    .array(
      z.object({
        category: z.string().describe("Skill category name, e.g. 'Languages'"),
        skills: z.array(z.string()).describe("List of skills in this category"),
      }),
    )
    .optional()
    .describe("Skill groups"),
  projects: z
    .array(
      z.object({
        name: z.string(),
        description: z.string(),
        url: z.string().optional(),
        technologies: z.array(z.string()).optional(),
        startDate: z.string().optional().describe("Format: YYYY-MM"),
        endDate: z.string().nullable().optional().describe("Format: YYYY-MM or null"),
      }),
    )
    .optional()
    .describe("Project entries"),
  templateId: z
    .enum(["modern", "classic", "minimal", "executive", "bold", "balanced", "clear"])
    .optional()
    .describe("Template to use. Call list_templates to see options. Defaults to 'modern'"),
  locale: z
    .enum(["en", "pt-BR", "es", "it", "zh", "ja", "de"])
    .optional()
    .describe("Language for section headers. Defaults to 'en'"),
  sectionOrder: z
    .array(z.enum(["summary", "experience", "education", "skills", "projects"]))
    .optional()
    .describe("Custom order of resume sections. Defaults to: summary, experience, education, skills, projects. Only sections with data are included."),
  outputPath: z
    .string()
    .optional()
    .describe("Absolute path to save the PDF. Defaults to ~/Downloads/<fullName>-resume.pdf"),
});

export type GenerateResumeInput = z.infer<typeof generateResumeSchema>;

export async function generateResume(input: GenerateResumeInput) {
  const locale = input.locale ?? "en";
  const templateId = input.templateId ?? "modern";

  const baseData = createEmptyResumeData();

  baseData.fullName = input.fullName;
  baseData.headline = input.headline ?? "";
  baseData.summary = input.summary ?? "";

  if (input.contact) {
    baseData.contact = {
      email: input.contact.email ?? "",
      phone: input.contact.phone ?? "",
      location: input.contact.location ?? "",
      linkedin: input.contact.linkedin ?? "",
      website: input.contact.website ?? "",
    };
  }

  if (input.experience) {
    baseData.experience = input.experience.map((e) => ({
      id: generateId(),
      company: e.company,
      title: e.title,
      location: e.location ?? "",
      startDate: e.startDate,
      endDate: e.endDate ?? null,
      current: e.current ?? e.endDate == null,
      description: e.description,
    }));
  }

  if (input.education) {
    baseData.education = input.education.map((e) => ({
      id: generateId(),
      school: e.school,
      degree: e.degree,
      field: e.field,
      startDate: e.startDate,
      endDate: e.endDate ?? null,
      gpa: e.gpa,
      highlights: e.highlights ?? "",
    }));
  }

  if (input.skillGroups) {
    baseData.skillGroups = input.skillGroups.map((g) => ({
      id: generateId(),
      category: g.category,
      skills: g.skills,
    }));
  }

  if (input.projects) {
    baseData.projects = input.projects.map((p) => ({
      id: generateId(),
      name: p.name,
      description: p.description,
      url: p.url,
      technologies: p.technologies ?? [],
      startDate: p.startDate ?? "",
      endDate: p.endDate ?? null,
    }));
  }

  // Enable sections that have data
  baseData.sections = {
    summary: !!baseData.summary,
    experience: baseData.experience.length > 0,
    education: baseData.education.length > 0,
    skills: baseData.skillGroups.length > 0,
    projects: baseData.projects.length > 0,
  };

  // Build section order: use custom order if provided, otherwise default
  let sectionOrder: string[];
  if (input.sectionOrder) {
    sectionOrder = input.sectionOrder.filter(
      (s) => baseData.sections[s as keyof typeof baseData.sections],
    );
  } else {
    sectionOrder = [];
    if (baseData.sections.summary) sectionOrder.push("summary");
    if (baseData.sections.experience) sectionOrder.push("experience");
    if (baseData.sections.education) sectionOrder.push("education");
    if (baseData.sections.skills) sectionOrder.push("skills");
    if (baseData.sections.projects) sectionOrder.push("projects");
  }
  baseData.sectionOrder = sectionOrder;

  const now = new Date().toISOString();
  const resume: Resume = {
    id: generateId(),
    name: `${input.fullName}'s Resume`,
    templateId,
    status: "complete",
    createdAt: now,
    updatedAt: now,
    exportCount: 0,
    data: baseData,
  };

  const messages = getMessages(locale);
  const buffer = await generateResumePDF(resume, locale, messages);

  const sanitizedName = input.fullName.replace(/[^a-zA-Z0-9-_ ]/g, "").replace(/\s+/g, "-");
  const outputPath =
    input.outputPath ?? resolve(homedir(), "Downloads", `${sanitizedName}-resume.pdf`);

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, buffer);

  const sectionsSummary = sectionOrder.join(", ");

  return {
    content: [
      {
        type: "text" as const,
        text: `Resume PDF generated successfully!\n\nFile: ${outputPath}\nTemplate: ${templateId}\nLocale: ${locale}\nSections: ${sectionsSummary}\n\nThe PDF has been saved and is ready to open.`,
      },
    ],
  };
}
