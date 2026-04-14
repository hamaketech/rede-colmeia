/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type LanguageCode = "pt" | "es" | "en";

type I18nContextValue = {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  languagePriority: { code: LanguageCode; label: string }[];
  t: (key: string) => string;
};

const languagePriority = [
  { code: "pt" as const, label: "Portugues" },
  { code: "es" as const, label: "Espanhol" },
  { code: "en" as const, label: "Ingles" }
];

const translations: Record<LanguageCode, Record<string, string>> = {
  pt: {
    "app.tagline": "Pessoas sustentando pessoas",
    "nav.home": "Inicio",
    "nav.partners": "Parceiros",
    "nav.transparency": "Transparencia",
    "nav.auth": "Entrar",
    "nav.languageLabel": "Idioma",
    "nav.visualLabel": "Visual",
    "nav.cvdLabel": "Filtro CVD",

    "landing.badge": "Ajuda mutua descentralizada",
    "landing.kicker": "Infraestrutura movida pela comunidade",
    "landing.title": "De pessoa para pessoa, com impacto rastreavel.",
    "landing.subtitle":
      "A Rede Colmeia transforma contribuicoes recorrentes em cestas basicas por meio de redes locais. Rapido, transparente e coletivo.",
    "landing.ctaPrimary": "Quero contribuir",
    "landing.ctaSecondary": "Ver transparencia publica",
    "landing.statContributors": "Contribuintes ativos",
    "landing.statPartners": "Redes parceiras",
    "landing.statFamilies": "Familias apoiadas",
    "landing.flowTitle": "Como a rede funciona",
    "landing.flowSubtitle":
      "Um ciclo operacional simples e responsavel que escala sem perder autonomia local.",
    "landing.step": "Passo",
    "landing.flow1Title": "Pessoas contribuem todo mes",
    "landing.flow1Description":
      "Apoiadores assinam um valor sustentavel. Cada contribuicao vira impacto real em alimentacao.",
    "landing.flow2Title": "Recursos viram capacidade de cestas",
    "landing.flow2Description":
      "A plataforma calcula capacidade operacional e distribuicao por regiao com logica transparente.",
    "landing.flow3Title": "Parceiros entregam localmente",
    "landing.flow3Description":
      "Parceiros locais identificam e entregam para familias com dignidade, velocidade e prestacao de contas.",
    "landing.finalTitle": "Ninguem fica sozinho.",
    "landing.finalBody":
      "Comece com uma contribuicao, um parceiro, uma familia. A rede cresce a cada acao.",
    "landing.finalPartnerCta": "Ser parceiro da Rede Colmeia",
    "landing.finalStartCta": "Comecar agora",

    "partners.title": "Parceiros",
    "partners.cardTitle": "Cadastro de parceiro",
    "partners.nameLabel": "Nome do parceiro",
    "partners.namePlaceholder": "Ex: Centro Comunitario A",
    "partners.previewButton": "Visualizar envio",
    "partners.dialogTitle": "Confirmar rascunho",
    "partners.dialogDescription": "Valide o nome antes de seguir para o cadastro completo.",
    "partners.draftLabel": "Parceiro em rascunho",
    "partners.noName": "Nome ainda nao informado",
    "partners.confirmDraft": "Confirmar rascunho",
    "partners.toastDraftSaved": "Rascunho salvo para a proxima etapa.",

    "auth.title": "Entrar",
    "auth.subtitle": "Fluxo de autenticacao em preparacao.",
    "transparency.title": "Transparencia",
    "transparency.subtitle": "Modulo de transparencia em preparacao.",
    "dashboard.title": "Painel",
    "dashboard.healthTitle": "Saude da plataforma",
    "dashboard.apiStatus": "Status da API",
    "dashboard.feedback": "Testar feedback",
    "dashboard.feedbackToast": "Fluxo de verificacao conectado.",
    "dashboard.errorPrefix": "Erro na verificacao"
  },
  es: {
    "app.tagline": "Personas sosteniendo personas",
    "nav.home": "Inicio",
    "nav.partners": "Aliados",
    "nav.transparency": "Transparencia",
    "nav.auth": "Acceder",
    "nav.languageLabel": "Idioma",
    "nav.visualLabel": "Visual",
    "nav.cvdLabel": "Filtro CVD",

    "landing.badge": "Ayuda mutua descentralizada",
    "landing.kicker": "Infraestructura impulsada por la comunidad",
    "landing.title": "De persona a persona, con impacto trazable.",
    "landing.subtitle":
      "Rede Colmeia transforma aportes recurrentes en canastas basicas por medio de redes locales. Rapido, transparente y colectivo.",
    "landing.ctaPrimary": "Quiero aportar",
    "landing.ctaSecondary": "Ver transparencia publica",
    "landing.statContributors": "Aportantes activos",
    "landing.statPartners": "Redes aliadas",
    "landing.statFamilies": "Familias apoyadas",
    "landing.flowTitle": "Como funciona la red",
    "landing.flowSubtitle":
      "Un ciclo operativo simple y responsable que escala sin perder autonomia local.",
    "landing.step": "Paso",
    "landing.flow1Title": "Las personas aportan cada mes",
    "landing.flow1Description":
      "Las personas suscriben un valor sostenible. Cada aporte se convierte en impacto alimentario real.",
    "landing.flow2Title": "Los fondos se convierten en capacidad",
    "landing.flow2Description":
      "La plataforma calcula capacidad operativa y asignacion regional con logica transparente.",
    "landing.flow3Title": "Aliados entregan localmente",
    "landing.flow3Description":
      "Aliados locales identifican y entregan a familias con dignidad, rapidez y trazabilidad.",
    "landing.finalTitle": "Nadie se queda solo.",
    "landing.finalBody":
      "Empieza con un aporte, un aliado, una familia. La red crece con cada accion.",
    "landing.finalPartnerCta": "Aliarse con Rede Colmeia",
    "landing.finalStartCta": "Comenzar ahora",

    "partners.title": "Aliados",
    "partners.cardTitle": "Registro de aliado",
    "partners.nameLabel": "Nombre del aliado",
    "partners.namePlaceholder": "Ej: Centro Comunitario A",
    "partners.previewButton": "Previsualizar envio",
    "partners.dialogTitle": "Confirmar borrador",
    "partners.dialogDescription": "Valida el nombre antes de avanzar al registro completo.",
    "partners.draftLabel": "Aliado en borrador",
    "partners.noName": "Nombre aun no informado",
    "partners.confirmDraft": "Confirmar borrador",
    "partners.toastDraftSaved": "Borrador guardado para el siguiente paso.",

    "auth.title": "Acceder",
    "auth.subtitle": "Flujo de autenticacion en preparacion.",
    "transparency.title": "Transparencia",
    "transparency.subtitle": "Modulo de transparencia en preparacion.",
    "dashboard.title": "Panel",
    "dashboard.healthTitle": "Salud de la plataforma",
    "dashboard.apiStatus": "Estado de la API",
    "dashboard.feedback": "Probar feedback",
    "dashboard.feedbackToast": "Flujo de verificacion conectado.",
    "dashboard.errorPrefix": "Error de verificacion"
  },
  en: {
    "app.tagline": "People sustaining people",
    "nav.home": "Home",
    "nav.partners": "Partners",
    "nav.transparency": "Transparency",
    "nav.auth": "Auth",
    "nav.languageLabel": "Language",
    "nav.visualLabel": "Visual",
    "nav.cvdLabel": "CVD Filter",

    "landing.badge": "Decentralized mutual aid",
    "landing.kicker": "Community powered infrastructure",
    "landing.title": "From people to people, with traceable impact.",
    "landing.subtitle":
      "Rede Colmeia transforms recurring contributions into essential food baskets through local community networks. Fast, transparent, and built for collective action.",
    "landing.ctaPrimary": "Become a contributor",
    "landing.ctaSecondary": "View public transparency",
    "landing.statContributors": "Active contributors",
    "landing.statPartners": "Partner networks",
    "landing.statFamilies": "Families supported",
    "landing.flowTitle": "How the network works",
    "landing.flowSubtitle":
      "A simple and accountable operating cycle that scales without losing local autonomy.",
    "landing.step": "Step",
    "landing.flow1Title": "People contribute monthly",
    "landing.flow1Description":
      "Supporters subscribe with a value they can sustain. Every contribution is converted into real food impact.",
    "landing.flow2Title": "Funds become basket capacity",
    "landing.flow2Description":
      "The platform calculates operational capacity and allocation by region with transparent conversion logic.",
    "landing.flow3Title": "Partners deliver locally",
    "landing.flow3Description":
      "Local partners identify and deliver to families with dignity, speed, and accountable reporting.",
    "landing.finalTitle": "No one stands alone.",
    "landing.finalBody":
      "Start with one contribution, one partner, one family. The network expands with every action.",
    "landing.finalPartnerCta": "Partner with Rede Colmeia",
    "landing.finalStartCta": "Start now",

    "partners.title": "Partners",
    "partners.cardTitle": "Partner onboarding",
    "partners.nameLabel": "Partner name",
    "partners.namePlaceholder": "Ex: Community Center A",
    "partners.previewButton": "Preview submission",
    "partners.dialogTitle": "Confirm partner draft",
    "partners.dialogDescription": "Validate name before moving to full registration.",
    "partners.draftLabel": "Draft partner",
    "partners.noName": "No name provided yet",
    "partners.confirmDraft": "Confirm draft",
    "partners.toastDraftSaved": "Partner draft saved for next step.",

    "auth.title": "Auth",
    "auth.subtitle": "Authentication flow scaffold ready.",
    "transparency.title": "Transparency",
    "transparency.subtitle": "Transparency feature scaffold ready.",
    "dashboard.title": "Dashboard",
    "dashboard.healthTitle": "Platform health",
    "dashboard.apiStatus": "API status",
    "dashboard.feedback": "Test feedback",
    "dashboard.feedbackToast": "Health check flow is connected.",
    "dashboard.errorPrefix": "Health check error"
  }
};

const storageKey = "rede-colmeia-language";

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<LanguageCode>("pt");

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey) as LanguageCode | null;
    if (stored && translations[stored]) {
      setLanguage(stored);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, language);
    document.documentElement.lang = language === "pt" ? "pt-BR" : language;
  }, [language]);

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage,
      languagePriority,
      t: (key: string) => translations[language][key] ?? translations.en[key] ?? key
    }),
    [language]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useLanguage() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
