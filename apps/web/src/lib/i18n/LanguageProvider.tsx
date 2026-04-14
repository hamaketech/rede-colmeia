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
    "auth.subtitle": "Acesse sua sessao ou crie um novo cadastro.",
    "auth.loginTitle": "Acessar conta",
    "auth.registerTitle": "Criar conta",
    "auth.loginTab": "Entrar",
    "auth.registerTab": "Registrar",
    "auth.emailLabel": "E-mail",
    "auth.emailPlaceholder": "voce@redecolmeia.dev",
    "auth.passwordLabel": "Senha",
    "auth.passwordPlaceholder": "minimo 8 caracteres",
    "auth.forgotPasswordAction": "Esqueci minha senha",
    "auth.loginAction": "Entrar agora",
    "auth.registerAction": "Criar conta",
    "auth.whoAmIAction": "Ver sessao atual",
    "auth.logoutAction": "Sair",
    "auth.logoutAllAction": "Sair de todos dispositivos",
    "auth.rotateAction": "Reforcar sessao",
    "auth.currentSession": "Sessao ativa",
    "auth.noSessionHint": "Nenhuma sessao ativa no navegador.",
    "auth.loginSuccess": "Sessao iniciada com sucesso.",
    "auth.registerSuccess": "Cadastro concluido com sucesso.",
    "auth.sessionLoaded": "Sessao carregada.",
    "auth.logoutSuccess": "Sessao encerrada.",
    "auth.noSession": "Nenhuma sessao encontrada.",
    "auth.errorGeneric": "Nao foi possivel concluir a autenticacao.",
    "auth.errorEmailInvalid": "Informe um e-mail valido.",
    "auth.errorPasswordRequired": "Informe sua senha.",
    "auth.errorPasswordShort": "A senha precisa ter pelo menos 8 caracteres.",
    "auth.errorCredentialExists": "Ja existe uma conta com esse e-mail.",
    "auth.errorRoleInvalid": "Perfil invalido para cadastro.",
    "auth.errorInvalidCredentials": "Credenciais invalidas. Verifique e tente novamente.",
    "auth.errorSessionExpired": "Sua sessao expirou. Entre novamente para continuar.",
    "auth.errorResetTokenRequired": "Informe o token de recuperacao.",
    "auth.errorResetTokenInvalid": "Token de recuperacao invalido ou expirado.",
    "auth.passwordRuleHint": "Use pelo menos 8 caracteres para criar sua conta.",
    "auth.recoveryHint": "Esqueceu a senha? Solicite um token e redefina sua conta.",
    "auth.recoveryEmailReadyInfo":
      "Fluxo pronto para ambiente final: enviaremos instrucoes por e-mail/SMS fora da plataforma.",
    "auth.devToolsToggle": "Ferramentas de desenvolvimento",
    "auth.devToolsHint":
      "Acoes avancadas de sessao e recuperacao estao temporariamente aqui ate migracao para Configuracoes.",
    "auth.requestResetAction": "Solicitar recuperacao",
    "auth.confirmResetAction": "Aplicar nova senha",
    "auth.devResetToolsToggle": "Ferramentas de reset",
    "auth.devResetToolsHint": "Uso interno para validar token e troca de senha em ambiente dev.",
    "auth.resetTokenLabel": "Token de recuperacao",
    "auth.resetTokenPlaceholder": "cole o token recebido",
    "auth.newPasswordLabel": "Nova senha",
    "auth.newPasswordPlaceholder": "nova senha com minimo 8 caracteres",
    "auth.resetRequested": "Se a conta existir, um token de recuperacao foi gerado.",
    "auth.resetConfirmed": "Senha atualizada com sucesso. Faca login novamente.",
    "auth.logoutAllSuccess": "Todas as sessoes foram encerradas.",
    "auth.rotateSuccess": "Sessao reforcada com sucesso.",
    "auth.devResetTokenLabel": "Token de desenvolvimento",
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
    "auth.subtitle": "Inicia sesion o crea una cuenta nueva.",
    "auth.loginTitle": "Entrar a la cuenta",
    "auth.registerTitle": "Crear cuenta",
    "auth.loginTab": "Entrar",
    "auth.registerTab": "Registrar",
    "auth.emailLabel": "Correo",
    "auth.emailPlaceholder": "tu@redecolmeia.dev",
    "auth.passwordLabel": "Contrasena",
    "auth.passwordPlaceholder": "minimo 8 caracteres",
    "auth.forgotPasswordAction": "Olvide mi contrasena",
    "auth.loginAction": "Iniciar sesion",
    "auth.registerAction": "Crear cuenta",
    "auth.whoAmIAction": "Ver sesion actual",
    "auth.logoutAction": "Salir",
    "auth.logoutAllAction": "Cerrar todas las sesiones",
    "auth.rotateAction": "Reforzar sesion",
    "auth.currentSession": "Sesion activa",
    "auth.noSessionHint": "No hay sesion activa en el navegador.",
    "auth.loginSuccess": "Sesion iniciada correctamente.",
    "auth.registerSuccess": "Cuenta creada correctamente.",
    "auth.sessionLoaded": "Sesion cargada.",
    "auth.logoutSuccess": "Sesion cerrada.",
    "auth.noSession": "No se encontro sesion.",
    "auth.errorGeneric": "No fue posible completar la autenticacion.",
    "auth.errorEmailInvalid": "Ingresa un correo valido.",
    "auth.errorPasswordRequired": "Ingresa tu contrasena.",
    "auth.errorPasswordShort": "La contrasena debe tener al menos 8 caracteres.",
    "auth.errorCredentialExists": "Ya existe una cuenta con este correo.",
    "auth.errorRoleInvalid": "Perfil invalido para registro.",
    "auth.errorInvalidCredentials": "Credenciales invalidas. Verifica e intenta de nuevo.",
    "auth.errorSessionExpired": "Tu sesion expiro. Vuelve a iniciar para continuar.",
    "auth.errorResetTokenRequired": "Ingresa el token de recuperacion.",
    "auth.errorResetTokenInvalid": "Token de recuperacion invalido o vencido.",
    "auth.passwordRuleHint": "Usa al menos 8 caracteres para crear tu cuenta.",
    "auth.recoveryHint": "Olvidaste tu contrasena? Solicita un token y define una nueva.",
    "auth.recoveryEmailReadyInfo":
      "Flujo listo para ambiente final: enviaremos instrucciones por correo/SMS fuera de la plataforma.",
    "auth.devToolsToggle": "Herramientas de desarrollo",
    "auth.devToolsHint":
      "Acciones avanzadas de sesion y recuperacion permanecen aqui temporalmente hasta Configuracion.",
    "auth.requestResetAction": "Solicitar recuperacion",
    "auth.confirmResetAction": "Aplicar nueva contrasena",
    "auth.devResetToolsToggle": "Herramientas de reset",
    "auth.devResetToolsHint": "Uso interno para validar token y cambio de contrasena en dev.",
    "auth.resetTokenLabel": "Token de recuperacion",
    "auth.resetTokenPlaceholder": "pega el token recibido",
    "auth.newPasswordLabel": "Nueva contrasena",
    "auth.newPasswordPlaceholder": "nueva contrasena con minimo 8 caracteres",
    "auth.resetRequested": "Si la cuenta existe, se genero un token de recuperacion.",
    "auth.resetConfirmed": "Contrasena actualizada. Inicia sesion nuevamente.",
    "auth.logoutAllSuccess": "Todas las sesiones fueron cerradas.",
    "auth.rotateSuccess": "Sesion reforzada con exito.",
    "auth.devResetTokenLabel": "Token de desarrollo",
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
    "auth.subtitle": "Sign in or register to start a session.",
    "auth.loginTitle": "Sign in",
    "auth.registerTitle": "Create account",
    "auth.loginTab": "Login",
    "auth.registerTab": "Register",
    "auth.emailLabel": "Email",
    "auth.emailPlaceholder": "you@redecolmeia.dev",
    "auth.passwordLabel": "Password",
    "auth.passwordPlaceholder": "at least 8 characters",
    "auth.forgotPasswordAction": "Forgot password?",
    "auth.loginAction": "Sign in now",
    "auth.registerAction": "Create account",
    "auth.whoAmIAction": "Check current session",
    "auth.logoutAction": "Logout",
    "auth.logoutAllAction": "Logout all devices",
    "auth.rotateAction": "Rotate session",
    "auth.currentSession": "Active session",
    "auth.noSessionHint": "No active browser session.",
    "auth.loginSuccess": "Session started successfully.",
    "auth.registerSuccess": "Account created successfully.",
    "auth.sessionLoaded": "Session loaded.",
    "auth.logoutSuccess": "Session ended.",
    "auth.noSession": "No session found.",
    "auth.errorGeneric": "Could not complete authentication.",
    "auth.errorEmailInvalid": "Enter a valid email.",
    "auth.errorPasswordRequired": "Enter your password.",
    "auth.errorPasswordShort": "Password must be at least 8 characters.",
    "auth.errorCredentialExists": "An account with this email already exists.",
    "auth.errorRoleInvalid": "Invalid role for registration.",
    "auth.errorInvalidCredentials": "Invalid credentials. Check and try again.",
    "auth.errorSessionExpired": "Your session expired. Please log in again.",
    "auth.errorResetTokenRequired": "Enter the recovery token.",
    "auth.errorResetTokenInvalid": "Recovery token is invalid or expired.",
    "auth.passwordRuleHint": "Use at least 8 characters when creating your account.",
    "auth.recoveryHint": "Forgot password? Request a token and apply a new password.",
    "auth.recoveryEmailReadyInfo":
      "Flow is production-ready: reset instructions will be delivered by email/SMS outside the platform.",
    "auth.devToolsToggle": "Development tools",
    "auth.devToolsHint":
      "Advanced session and recovery actions stay here temporarily until moved to Settings.",
    "auth.requestResetAction": "Request recovery",
    "auth.confirmResetAction": "Apply new password",
    "auth.devResetToolsToggle": "Reset tools",
    "auth.devResetToolsHint": "Internal use to validate token and password reset in dev.",
    "auth.resetTokenLabel": "Recovery token",
    "auth.resetTokenPlaceholder": "paste the received token",
    "auth.newPasswordLabel": "New password",
    "auth.newPasswordPlaceholder": "new password with at least 8 characters",
    "auth.resetRequested": "If the account exists, a recovery token was generated.",
    "auth.resetConfirmed": "Password updated successfully. Please log in again.",
    "auth.logoutAllSuccess": "All sessions were revoked.",
    "auth.rotateSuccess": "Session rotated successfully.",
    "auth.devResetTokenLabel": "Development token",
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
