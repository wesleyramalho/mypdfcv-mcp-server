import { writeFile, mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, resolve } from "node:path";
import { type Resume, generateId } from "@mypdfcv/pdf-core";
import { generateResumePDF } from "@mypdfcv/pdf-core/server";
import { getMessages } from "@mypdfcv/i18n/server";
import { z } from "zod";

const entryWithOptionalId = <T extends z.ZodRawShape>(shape: T) =>
  z.object({ id: z.string().optional(), ...shape });

export const generateFromJsonSchema = z.object({
  templateId: z
    .enum(["modern", "classic", "minimal", "executive", "bold", "balanced", "clear"])
    .optional()
    .describe("Template ID. Defaults to 'modern'"),
  locale: z
    .enum(["en", "pt-BR", "es", "it", "zh", "ja", "de"])
    .optional()
    .describe("Language for section headers. Defaults to 'en'"),
  outputPath: z
    .string()
    .optional()
    .describe("Absolute path to save the PDF. Defaults to ~/Downloads/<fullName>-resume.pdf"),
  data: z.object({
    fullName: z.string(),
    headline: z.string().optional().default(""),
    summary: z.string().optional().default(""),
    photo: z.string().optional(),
    contact: z.object({
      email: z.string().optional().default(""),
      phone: z.string().optional().default(""),
      location: z.string().optional().default(""),
      linkedin: z.string().optional().default(""),
      website: z.string().optional().default(""),
    }).optional().default({}),
    experience: z.array(entryWithOptionalId({
      company: z.string(),
      title: z.string(),
      location: z.string().optional().default(""),
      startDate: z.string(),
      endDate: z.string().nullable().optional().default(null),
      current: z.boolean().optional(),
      description: z.string(),
    })).optional().default([]),
    education: z.array(entryWithOptionalId({
      school: z.string(),
      degree: z.string(),
      field: z.string(),
      startDate: z.string(),
      endDate: z.string().nullable().optional().default(null),
      gpa: z.string().optional(),
      highlights: z.string().optional().default(""),
    })).optional().default([]),
    skillGroups: z.array(entryWithOptionalId({
      category: z.string(),
      skills: z.array(z.string()),
    })).optional().default([]),
    projects: z.array(entryWithOptionalId({
      name: z.string(),
      description: z.string(),
      url: z.string().optional(),
      technologies: z.array(z.string()).optional().default([]),
      startDate: z.string().optional().default(""),
      endDate: z.string().nullable().optional().default(null),
    })).optional().default([]),
    sections: z.object({
      summary: z.boolean().optional(),
      experience: z.boolean().optional(),
      education: z.boolean().optional(),
      skills: z.boolean().optional(),
      projects: z.boolean().optional(),
    }).optional(),
    sectionOrder: z
      .array(z.string())
      .optional()
      .describe("Custom section order. Defaults to sections with data."),
  }).describe("Full resume data object"),
});

export type GenerateFromJsonInput = z.infer<typeof generateFromJsonSchema>;

export async function generateFromJson(input: GenerateFromJsonInput) {
  const locale = input.locale ?? "en";
  const templateId = input.templateId ?? "modern";
  const d = input.data;

  const experience = d.experience.map((e) => ({
    ...e,
    id: e.id ?? generateId(),
    current: e.current ?? e.endDate == null,
  }));

  const education = d.education.map((e) => ({
    ...e,
    id: e.id ?? generateId(),
  }));

  const skillGroups = d.skillGroups.map((g) => ({
    ...g,
    id: g.id ?? generateId(),
  }));

  const projects = d.projects.map((p) => ({
    ...p,
    id: p.id ?? generateId(),
  }));

  const sections = d.sections ?? {
    summary: !!d.summary,
    experience: experience.length > 0,
    education: education.length > 0,
    skills: skillGroups.length > 0,
    projects: projects.length > 0,
  };

  let sectionOrder: string[];
  if (d.sectionOrder) {
    sectionOrder = d.sectionOrder;
  } else {
    sectionOrder = [];
    if (sections.summary) sectionOrder.push("summary");
    if (sections.experience) sectionOrder.push("experience");
    if (sections.education) sectionOrder.push("education");
    if (sections.skills) sectionOrder.push("skills");
    if (sections.projects) sectionOrder.push("projects");
  }

  const now = new Date().toISOString();
  const resume: Resume = {
    id: generateId(),
    name: `${d.fullName}'s Resume`,
    templateId,
    status: "complete",
    createdAt: now,
    updatedAt: now,
    exportCount: 0,
    data: {
      fullName: d.fullName,
      headline: d.headline ?? "",
      summary: d.summary ?? "",
      photo: d.photo,
      contact: {
        email: d.contact?.email ?? "",
        phone: d.contact?.phone ?? "",
        location: d.contact?.location ?? "",
        linkedin: d.contact?.linkedin ?? "",
        website: d.contact?.website ?? "",
      },
      experience,
      education,
      skillGroups,
      projects,
      sections: {
        summary: sections.summary ?? false,
        experience: sections.experience ?? false,
        education: sections.education ?? false,
        skills: sections.skills ?? false,
        projects: sections.projects ?? false,
      },
      sectionOrder,
    },
  };

  const messages = getMessages(locale);
  const buffer = await generateResumePDF(resume, locale, messages);

  const sanitizedName = d.fullName.replace(/[^a-zA-Z0-9-_ ]/g, "").replace(/\s+/g, "-");
  const outputPath =
    input.outputPath ?? resolve(homedir(), "Downloads", `${sanitizedName}-resume.pdf`);

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, buffer);

  return {
    content: [
      {
        type: "text" as const,
        text: `Resume PDF generated successfully!\n\nFile: ${outputPath}\nTemplate: ${templateId}\nLocale: ${locale}\nSections: ${sectionOrder.join(", ")}\n\nThe PDF has been saved and is ready to open.`,
      },
    ],
  };
}
