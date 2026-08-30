export type SupportedLanguage = 'en' | 'ha' | 'sw' | 'fr'

type MessageKey =
  | 'dashboard'
  | 'online'
  | 'offline'
  | 'syncing'
  | 'expenses'
  | 'revenue'
  | 'netProfit'
  | 'weatherAdvice'
  | 'upgradePro'
  | 'exportPdf'
  | 'exportCsv'

const messages: Record<SupportedLanguage, Record<MessageKey, string>> = {
  en: {
    dashboard: 'Farm Dashboard', online: 'Online', offline: 'Offline', syncing: 'Syncing changes',
    expenses: 'Expenses', revenue: 'Revenue', netProfit: 'Net profit', weatherAdvice: 'Today’s farm advice',
    upgradePro: 'Upgrade to Pro', exportPdf: 'Export PDF', exportCsv: 'Export CSV',
  },
  ha: {
    dashboard: 'Allon Gonaki', online: 'Kana kan layi', offline: 'Babu intanet', syncing: 'Ana daidaita bayanai',
    expenses: 'Kuɗaɗe', revenue: 'Kuɗin shiga', netProfit: 'Ribar da ta rage', weatherAdvice: 'Shawarar gona ta yau',
    upgradePro: 'Haɓaka zuwa Pro', exportPdf: 'Fitar da PDF', exportCsv: 'Fitar da CSV',
  },
  sw: {
    dashboard: 'Dashibodi ya Shamba', online: 'Mtandaoni', offline: 'Nje ya mtandao', syncing: 'Inasawazisha mabadiliko',
    expenses: 'Gharama', revenue: 'Mapato', netProfit: 'Faida halisi', weatherAdvice: 'Ushauri wa shamba wa leo',
    upgradePro: 'Boresha hadi Pro', exportPdf: 'Hamisha PDF', exportCsv: 'Hamisha CSV',
  },
  fr: {
    dashboard: 'Tableau de la ferme', online: 'En ligne', offline: 'Hors ligne', syncing: 'Synchronisation des changements',
    expenses: 'Dépenses', revenue: 'Revenus', netProfit: 'Bénéfice net', weatherAdvice: 'Conseil agricole du jour',
    upgradePro: 'Passer à Pro', exportPdf: 'Exporter PDF', exportCsv: 'Exporter CSV',
  },
}

export function t(language: SupportedLanguage, key: MessageKey) {
  return messages[language]?.[key] ?? messages.en[key]
}
