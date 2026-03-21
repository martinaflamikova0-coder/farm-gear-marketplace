import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import i18n from "./i18n";

// Sync <html lang="..."> with current i18n language
const updateHtmlLang = (lang: string) => {
  document.documentElement.setAttribute('lang', lang);
};
updateHtmlLang(i18n.language);
i18n.on('languageChanged', updateHtmlLang);

createRoot(document.getElementById("root")!).render(<App />);
