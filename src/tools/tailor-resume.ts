import { z } from "zod";

export const tailorResumeSchema = z.object({
  jobDescription: z.string().describe("The full job posting or description text"),
  fullName: z.string().describe("Full name of the person"),
  headline: z.string().optional().describe("Current professional headline"),
  summary: z.string().optional().describe("Current professional summary"),
  experience: z
    .array(
      z.object({
        company: z.string(),
        title: z.string(),
        location: z.string().optional(),
        startDate: z.string().describe("Format: YYYY-MM"),
        endDate: z.string().nullable().optional(),
        current: z.boolean().optional(),
        description: z.string(),
      }),
    )
    .optional()
    .describe("Current work experience"),
  education: z
    .array(
      z.object({
        school: z.string(),
        degree: z.string(),
        field: z.string(),
        startDate: z.string(),
        endDate: z.string().nullable().optional(),
        gpa: z.string().optional(),
        highlights: z.string().optional(),
      }),
    )
    .optional()
    .describe("Current education"),
  skillGroups: z
    .array(
      z.object({
        category: z.string(),
        skills: z.array(z.string()),
      }),
    )
    .optional()
    .describe("Current skill groups"),
  projects: z
    .array(
      z.object({
        name: z.string(),
        description: z.string(),
        url: z.string().optional(),
        technologies: z.array(z.string()).optional(),
        startDate: z.string().optional(),
        endDate: z.string().nullable().optional(),
      }),
    )
    .optional()
    .describe("Current projects"),
  additionalContext: z
    .string()
    .optional()
    .describe("Any additional info about the person not in the resume (other skills, achievements, preferences)"),
});

export type TailorResumeInput = z.infer<typeof tailorResumeSchema>;

export function tailorResume(input: TailorResumeInput) {
  const currentSkills = (input.skillGroups ?? [])
    .flatMap((g) => g.skills)
    .join(", ");

  const currentRoles = (input.experience ?? [])
    .map((e) => `${e.title} at ${e.company}`)
    .join("; ");

  const analysis = [
    "## Resume Tailoring Analysis",
    "",
    `**Candidate:** ${input.fullName}`,
    currentRoles ? `**Current/Past Roles:** ${currentRoles}` : "",
    currentSkills ? `**Current Skills:** ${currentSkills}` : "",
    "",
    "---",
    "",
    "## Job Description",
    "",
    input.jobDescription,
    "",
    "---",
    "",
    "## Instructions for Tailoring",
    "",
    "Based on the job description above and the candidate's current resume data, please:",
    "",
    "1. **Headline**: Rewrite the headline to align with the target role",
    "2. **Summary**: Rewrite the summary to emphasize relevant experience and skills for this specific position",
    "3. **Experience**: Rewrite bullet points to highlight accomplishments most relevant to the job requirements. Use keywords from the job description where truthful.",
    "4. **Skills**: Reorder skill groups and individual skills to prioritize those mentioned in the job description. Add any missing skills the candidate likely has based on their experience.",
    "5. **Section Order**: Suggest the best section order for this application (e.g., if the job emphasizes skills, put skills before experience)",
    "6. **Projects**: If relevant, tailor project descriptions to highlight technologies/outcomes mentioned in the job description",
    "",
    "After tailoring, call `generate_resume_pdf` with the improved data to create the PDF.",
    input.additionalContext
      ? `\n## Additional Context\n\n${input.additionalContext}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    content: [
      {
        type: "text" as const,
        text: analysis,
      },
    ],
  };
}
