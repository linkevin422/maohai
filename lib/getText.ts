import { translations } from "./language";
import { useContext } from "react";
import { LanguageContext } from "./LanguageProvider";

type Lang = "en" | "zh-Hant";

export function getText(key: string, lang: Lang = "en"): string {
  return (
    translations[key as keyof typeof translations]?.[lang] ||
    translations[key as keyof typeof translations]?.en ||
    key
  );
}

export function useText() {
  const context = useContext(LanguageContext);
  const lang = context.lang as Lang;
  return {
    getText: (key: string) => getText(key, lang),
  };
}
