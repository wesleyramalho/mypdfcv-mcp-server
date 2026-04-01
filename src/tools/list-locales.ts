import { locales } from "@mypdfcv/i18n";

const LOCALE_LABELS: Record<string, string> = {
  en: "English",
  "pt-BR": "Portuguese (Brazil)",
  es: "Spanish",
  it: "Italian",
  zh: "Chinese",
  ja: "Japanese",
  de: "German",
};

export function listLocales() {
  const result = locales.map((code) => ({
    code,
    label: LOCALE_LABELS[code] ?? code,
  }));

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}
