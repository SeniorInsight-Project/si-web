export type TrendPeriod = '7d' | '30d'

export type RiskBand = 'ESTAVEL' | 'ATENCAO' | 'CRITICO'

export type TrendPoint = {
  label: string
  score: number
  heartRate: number
  steps: number
  sleepHours: number
}

export type FamiliarOverview = {
  elderName: string
  elderAge: number
  riskScore: number
  riskBand: RiskBand
  lastUpdated: string
  aiSummary: string
  subscriptionPlan: string
  subscriptionStatus: string
  careNetwork: {
    name: string
    role: string
    status: string
  }[]
  recentDoses: {
    medicine: string
    dosage: string
    time: string
    confirmed: boolean
  }[]
  trends: TrendPoint[]
}

export type MedicoPatient = {
  id: string
  name: string
  age: number
  riskScore: number
  riskBand: RiskBand
  lastUpdated: string
  comorbidities: string[]
  latestReportDate: string
}

export type MedicoOverview = {
  doctorName: string
  specialty: string
  readOnlyNotice: string
  patients: MedicoPatient[]
  trends: TrendPoint[]
}

export type OperadoraCohortRow = {
  code: string
  ageGroup: string
  riskBand: RiskBand
  riskScore: number
  lastSync: string
  activeAlerts: number
}

export type OperadoraOverview = {
  operatorName: string
  totalLives: number
  stableCount: number
  attentionCount: number
  criticalCount: number
  lastImportBatch: {
    fileName: string
    processedAt: string
    importedLives: number
    status: string
  }
  cohort: OperadoraCohortRow[]
  trends: TrendPoint[]
}

export type EquipeOverview = {
  activePromptVersion: string
  modelName: string
  dailyBudgetUsedPct: number
  dailyCallsCount: number
  p95LatencyMs: number
  prompts: {
    version: string
    status: string
    updatedAt: string
    avgTokens: number
  }[]
  limits: {
    name: string
    current: string
    threshold: string
    status: string
  }[]
  lgpdRequests: {
    protocol: string
    type: 'EXPORTACAO' | 'EXCLUSAO'
    requestedAt: string
    status: string
  }[]
  trends: TrendPoint[]
}

const SEVEN_DAY_TRENDS: TrendPoint[] = [
  { label: '18/10', score: 22, heartRate: 72, steps: 4120, sleepHours: 7.4 },
  { label: '19/10', score: 24, heartRate: 74, steps: 3980, sleepHours: 7.1 },
  { label: '20/10', score: 21, heartRate: 71, steps: 4450, sleepHours: 7.6 },
  { label: '21/10', score: 28, heartRate: 76, steps: 3420, sleepHours: 6.8 },
  { label: '22/10', score: 25, heartRate: 73, steps: 4010, sleepHours: 7.2 },
  { label: '23/10', score: 20, heartRate: 70, steps: 4680, sleepHours: 7.8 },
  { label: '24/10', score: 19, heartRate: 72, steps: 4520, sleepHours: 7.5 },
]

const THIRTY_DAY_TRENDS: TrendPoint[] = Array.from({ length: 30 }, (_, index) => {
  const day = index + 1
  const wave = Math.sin(index / 3.5)
  const score = Math.round(23 + wave * 6 + (index % 4 === 0 ? 2 : -1))
  const heartRate = Math.round(72 + wave * 4)
  const steps = Math.round(4100 - wave * 450 + (index % 3) * 140)
  const sleepHours = Number((7.2 - wave * 0.4).toFixed(1))

  return {
    label: `${String(day).padStart(2, '0')}/10`,
    score,
    heartRate,
    steps,
    sleepHours,
  }
})

function getTrendsByPeriod(period: TrendPeriod): TrendPoint[] {
  return period === '7d' ? SEVEN_DAY_TRENDS : THIRTY_DAY_TRENDS
}

export async function fetchFamiliarOverview(period: TrendPeriod): Promise<FamiliarOverview> {
  return {
    elderName: 'Dona Maria Aparecida',
    elderAge: 78,
    riskScore: 19,
    riskBand: 'ESTAVEL',
    lastUpdated: 'Hoje às 10:15 · Health Connect sincronizado',
    aiSummary:
      'Padrão cardiorrespiratório e sono estáveis nos últimos 7 dias. Adesão integral aos medicamentos matinais e caminhada leve dentro da linha de base.',
    subscriptionPlan: 'SeniorInsight Premium Familiar',
    subscriptionStatus: 'Ativa · Renovação em 15/11/2026',
    careNetwork: [
      { name: 'Carlos Eduardo (Você)', role: 'Familiar Administrador', status: 'Notificações ativas' },
      { name: 'Roberta Lima', role: 'Neta · Rede de apoio', status: 'Notificações ativas' },
      { name: 'Dr. Henrique Silva', role: 'Cardiologista (Leitura)', status: 'Relatório semanal ativo' },
    ],
    recentDoses: [
      { medicine: 'Losartana Potássica', dosage: '50 mg · 1 comprimido', time: '08:00', confirmed: true },
      { medicine: 'Rosuvastatina', dosage: '10 mg · 1 comprimido', time: '10:00', confirmed: true },
      { medicine: 'Metformina XR', dosage: '500 mg · após jantar', time: '20:00', confirmed: false },
    ],
    trends: getTrendsByPeriod(period),
  }
}

export async function fetchMedicoOverview(period: TrendPeriod): Promise<MedicoOverview> {
  return {
    doctorName: 'Dr. Henrique Silva',
    specialty: 'Cardiologia e Clínica Médica · CRM-DF 18420',
    readOnlyNotice: 'Acesso clínico somente leitura autorizado pela família (RN-011 / LGPD).',
    patients: [
      {
        id: 'pac-01',
        name: 'Maria Aparecida Lima',
        age: 78,
        riskScore: 19,
        riskBand: 'ESTAVEL',
        lastUpdated: '24/10/2026 10:15',
        comorbidities: ['Hipertensão arterial', 'Diabetes tipo 2'],
        latestReportDate: '19/10/2026 (PDF assinado)',
      },
      {
        id: 'pac-02',
        name: 'Antônio Carlos Ferreira',
        age: 82,
        riskScore: 54,
        riskBand: 'ATENCAO',
        lastUpdated: '24/10/2026 09:40',
        comorbidities: ['Fibrilação atrial', 'DPOC leve'],
        latestReportDate: '19/10/2026 (PDF assinado)',
      },
      {
        id: 'pac-03',
        name: 'Helena Souza Mendes',
        age: 75,
        riskScore: 26,
        riskBand: 'ESTAVEL',
        lastUpdated: '24/10/2026 08:55',
        comorbidities: ['Hipotireoidismo', 'Osteoporose'],
        latestReportDate: '19/10/2026 (PDF assinado)',
      },
    ],
    trends: getTrendsByPeriod(period),
  }
}

export async function fetchOperadoraOverview(period: TrendPeriod): Promise<OperadoraOverview> {
  return {
    operatorName: 'ViverBem Saúde Suplementar (B2B)',
    totalLives: 420,
    stableCount: 362,
    attentionCount: 47,
    criticalCount: 11,
    lastImportBatch: {
      fileName: 'carteira_beneficiarios_out2026.csv',
      processedAt: '23/10/2026 às 18:20',
      importedLives: 420,
      status: 'Processado sem erros',
    },
    cohort: [
      {
        code: 'BEN-9041-DF',
        ageGroup: '80–84 anos',
        riskBand: 'CRITICO',
        riskScore: 78,
        lastSync: 'Há 12 min',
        activeAlerts: 2,
      },
      {
        code: 'BEN-3318-DF',
        ageGroup: '75–79 anos',
        riskBand: 'ATENCAO',
        riskScore: 52,
        lastSync: 'Há 28 min',
        activeAlerts: 1,
      },
      {
        code: 'BEN-7720-GO',
        ageGroup: '70–74 anos',
        riskBand: 'ESTAVEL',
        riskScore: 21,
        lastSync: 'Há 15 min',
        activeAlerts: 0,
      },
      {
        code: 'BEN-5104-SP',
        ageGroup: '65–69 anos',
        riskBand: 'ESTAVEL',
        riskScore: 16,
        lastSync: 'Há 9 min',
        activeAlerts: 0,
      },
    ],
    trends: getTrendsByPeriod(period),
  }
}

export async function fetchEquipeOverview(period: TrendPeriod): Promise<EquipeOverview> {
  return {
    activePromptVersion: 'insight-v2.4-ptbr',
    modelName: 'gemini-2.5-flash (schema JSON validado)',
    dailyBudgetUsedPct: 38,
    dailyCallsCount: 1840,
    p95LatencyMs: 640,
    prompts: [
      {
        version: 'insight-v2.4-ptbr',
        status: 'Ativo em produção',
        updatedAt: '15/10/2026',
        avgTokens: 612,
      },
      {
        version: 'insight-v2.3-ptbr',
        status: 'Reserva homologada',
        updatedAt: '01/10/2026',
        avgTokens: 590,
      },
    ],
    limits: [
      {
        name: 'Teto diário Gemini (insight-service)',
        current: '1.840 / 5.000 chamadas',
        threshold: '80% alerta · 100% circuit breaker',
        status: 'Normal',
      },
      {
        name: 'Latência de entrega SOS (p95)',
        current: '1,4 s (servidor) · 4,8 s (push)',
        threshold: '≤ 2 s servidor / ≤ 10 s total (RNF-001)',
        status: 'Dentro do SLA',
      },
      {
        name: 'Sessões BFF ativas no Redis',
        current: '214 sessões (gw:sess:*)',
        threshold: 'TTL 15 min · anti-CSRF ativo',
        status: 'Normal',
      },
    ],
    lgpdRequests: [
      {
        protocol: 'LGPD-2026-0089',
        type: 'EXPORTACAO',
        requestedAt: '23/10/2026 14:10',
        status: 'Concluído (URL assinada 7 dias)',
      },
      {
        protocol: 'LGPD-2026-0091',
        type: 'EXCLUSAO',
        requestedAt: '24/10/2026 09:05',
        status: 'Evento lgpd.erasure.requested confirmado',
      },
    ],
    trends: getTrendsByPeriod(period),
  }
}
