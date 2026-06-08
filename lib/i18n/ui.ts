import type { AppLanguage } from "@/lib/i18n/config";

export type UiCopy = {
  nav: {
    home: string;
    about: string;
    backend: string;
    trust: string;
    pricing: string;
    faq: string;
    contact: string;
    dashboard: string;
    signIn: string;
    signUp: string;
    signOut: string;
    menu: string;
    theme: string;
  };
  home: {
    badge: string;
    heroDescription: string;
    start: string;
    login: string;
    noSubscription: string;
    noAds: string;
    dataRemovable: string;
    howItWorks: string;
    simpleSteps: string;
    howItWorksDescription: string;
    features: string;
    featuresTitle: string;
    safetyTrust: string;
    safetyTrustTitle: string;
    startToday: string;
    createFreeAccount: string;
    learnMore: string;
  };
  auth: {
    login: {
      title: string;
      subtitle: string;
      description: string;
      noAccountYet: string;
      createOneFree: string;
      email: string;
      password: string;
      forgotPassword: string;
      signIn: string;
      signingIn: string;
      termsIntro: string;
      terms: string;
      and: string;
      privacy: string;
    };
    register: {
      title: string;
      subtitle: string;
      description: string;
      alreadyHaveAccount: string;
      signIn: string;
      fullName: string;
      email: string;
      password: string;
      confirmPassword: string;
      acceptTerms: string;
      terms: string;
      and: string;
      privacy: string;
      createAccount: string;
      creatingAccount: string;
    };
  };
  contact: {
    title: string;
    description: string;
    email: string;
    supportHours: string;
    responseTime: string;
    sendMessage: string;
    messageSent: string;
    name: string;
    subject: string;
    message: string;
    submit: string;
  };
  footer: {
    app: string;
    legal: string;
    secure: string;
    disclaimerTitle: string;
    disclaimerBody: string;
    copyright: string;
    madeWith: string;
    forYourHealth: string;
  };
  dashboardShell: {
    menu: string;
    signOut: string;
  };
};

const uiCopy: Record<AppLanguage, UiCopy> = {
  ro: {
    nav: {
      home: "Acasa",
      about: "Despre",
      backend: "De ce AI?",
      trust: "Incredere",
      pricing: "Preturi",
      faq: "FAQ",
      contact: "Contact",
      dashboard: "Panou",
      signIn: "Autentificare",
      signUp: "Creeaza cont",
      signOut: "Iesire din cont",
      menu: "Meniu",
      theme: "Comuta tema",
    },
    home: {
      badge: "Gratuit · Fara reclame · Sigur",
      heroDescription: "Un loc sigur pentru a intelege mai bine intolerantele alimentare si reactiile tale.",
      start: "Incepe acum",
      login: "Autentificare",
      noSubscription: "Fara abonament",
      noAds: "Fara reclame",
      dataRemovable: "Date sterse oricand",
      howItWorks: "Cum functioneaza",
      simpleSteps: "Simplu, in 3 pasi",
      howItWorksDescription: "Porneste in cateva minute si incepe sa intelegi mai bine ce functioneaza pentru corpul tau.",
      features: "Functionalitati",
      featuresTitle: "Tot ce ai nevoie, la un loc",
      safetyTrust: "Siguranta & Incredere",
      safetyTrustTitle: "Transparenta completa",
      startToday: "Incepe astazi, gratuit",
      createFreeAccount: "Creeaza cont gratuit",
      learnMore: "Afla mai mult",
    },
    auth: {
      login: {
        title: "Autentificare",
        subtitle: "Acceseaza-ti contul NutriSense Intolerances",
        description: "Autentifica-te pentru a accesa profilul tau, jurnalul de monitorizare si recomandarile salvate.",
        noAccountYet: "Nu ai cont? ",
        createOneFree: "Creeaza unul gratuit",
        email: "Adresa de email",
        password: "Parola",
        forgotPassword: "Ai uitat parola?",
        signIn: "Autentificare",
        signingIn: "Se autentifica...",
        termsIntro: "Prin autentificare, accepti ",
        terms: "Termenii de utilizare",
        and: "si ",
        privacy: "Politica de Confidentialitate",
      },
      register: {
        title: "Creeaza un cont",
        subtitle: "Incepe sa-ti organizezi mai bine intolerantele alimentare.",
        description: "Contul tau iti permite sa salvezi intolerantele, preferintele si jurnalul personal.",
        alreadyHaveAccount: "Ai deja cont? ",
        signIn: "Autentifica-te",
        fullName: "Nume complet",
        email: "Adresa de email",
        password: "Parola",
        confirmPassword: "Confirma parola",
        acceptTerms: "Accept ",
        terms: "Termenii si Conditiile",
        and: "si ",
        privacy: "Politica de Confidentialitate",
        createAccount: "Creeaza cont",
        creatingAccount: "Se creeaza contul...",
      },
    },
    contact: {
      title: "Contact",
      description: "Ai o intrebare, o problema sau o sugestie? Trimite-ne un mesaj si iti raspundem cat mai repede.",
      email: "Email",
      supportHours: "Program suport",
      responseTime: "Timp de raspuns",
      sendMessage: "Trimite un mesaj",
      messageSent: "Mesaj trimis!",
      name: "Nume",
      subject: "Subiect",
      message: "Mesaj",
      submit: "Trimite mesajul",
    },
    footer: {
      app: "Aplicatie",
      legal: "Legal",
      secure: "Datele tale sunt in siguranta",
      disclaimerTitle: "Disclaimer medical:",
      disclaimerBody: "NutriSense Intolerances nu ofera sfaturi medicale. Informatiile sunt generale si nu inlocuiesc consultul unui medic sau nutritionist.",
      copyright: "Toate drepturile rezervate.",
      madeWith: "Facut cu",
      forYourHealth: "pentru sanatatea ta",
    },
    dashboardShell: {
      menu: "Meniu",
      signOut: "Iesire din cont",
    },
  },
  en: {
    nav: {
      home: "Home",
      about: "About",
      backend: "Why AI?",
      trust: "Trust",
      pricing: "Pricing",
      faq: "FAQ",
      contact: "Contact",
      dashboard: "Dashboard",
      signIn: "Sign in",
      signUp: "Create account",
      signOut: "Sign out",
      menu: "Menu",
      theme: "Toggle theme",
    },
    home: {
      badge: "Free · No ads · Secure",
      heroDescription: "A safe place to better understand food intolerances and your body reactions.",
      start: "Get started",
      login: "Login",
      noSubscription: "No subscription",
      noAds: "No ads",
      dataRemovable: "Data removable anytime",
      howItWorks: "How it works",
      simpleSteps: "Simple in 3 steps",
      howItWorksDescription: "Start in minutes and understand better what works for your body.",
      features: "Features",
      featuresTitle: "Everything you need in one place",
      safetyTrust: "Safety & Trust",
      safetyTrustTitle: "Complete transparency",
      startToday: "Start today, for free",
      createFreeAccount: "Create free account",
      learnMore: "Learn more",
    },
    auth: {
      login: {
        title: "Sign in",
        subtitle: "Access your NutriSense Intolerances account",
        description: "Sign in to access your profile, monitoring journal and saved guidance.",
        noAccountYet: "No account yet? ",
        createOneFree: "Create one for free",
        email: "Email address",
        password: "Password",
        forgotPassword: "Forgot password?",
        signIn: "Sign in",
        signingIn: "Signing in...",
        termsIntro: "By signing in, you agree to the ",
        terms: "Terms of Use",
        and: "and ",
        privacy: "Privacy Policy",
      },
      register: {
        title: "Create an account",
        subtitle: "Start organizing your food intolerances better.",
        description: "Your account lets you save intolerances, preferences and personal journal entries.",
        alreadyHaveAccount: "Already have an account? ",
        signIn: "Sign in",
        fullName: "Full name",
        email: "Email address",
        password: "Password",
        confirmPassword: "Confirm password",
        acceptTerms: "I accept the ",
        terms: "Terms and Conditions",
        and: "and ",
        privacy: "Privacy Policy",
        createAccount: "Create account",
        creatingAccount: "Creating account...",
      },
    },
    contact: {
      title: "Contact",
      description: "Have a question, issue or suggestion? Send us a message and we will reply as soon as possible.",
      email: "Email",
      supportHours: "Support hours",
      responseTime: "Response time",
      sendMessage: "Send a message",
      messageSent: "Message sent!",
      name: "Name",
      subject: "Subject",
      message: "Message",
      submit: "Send message",
    },
    footer: {
      app: "App",
      legal: "Legal",
      secure: "Your data is secure",
      disclaimerTitle: "Medical disclaimer:",
      disclaimerBody: "NutriSense Intolerances does not provide medical advice. Information is general and does not replace consultation with a doctor or dietitian.",
      copyright: "All rights reserved.",
      madeWith: "Made with",
      forYourHealth: "for your health",
    },
    dashboardShell: {
      menu: "Menu",
      signOut: "Sign out",
    },
  },
};

export function getUiCopy(lang: AppLanguage): UiCopy {
  return uiCopy[lang];
}