import { TEMPLATES } from "@mypdfcv/pdf-core";

export function listTemplates() {
  const templates = TEMPLATES.map(({ id, name, description, style }) => ({
    id,
    name,
    description,
    accentColor: style.accentColor,
    headerLayout: style.headerLayout,
    showPhoto: style.showPhoto,
    hasSidebar: !!style.sidebarColor,
  }));

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(templates, null, 2),
      },
    ],
  };
}
