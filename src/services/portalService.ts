export type TrendPeriod = '7d' | '30d'

export type RiskBand = 'ESTAVEL' | 'ATENCAO' | 'CRITICO'

export type TrendPoint = {
  label: string
  score: number
  heartRate: number
  steps: number
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

const SEVEN_DAY_TRENDS: TrendPoint[] = [
  { label: '18/10', score: 22, heartRate: 72, steps: 4120 },
  { label: '19/10', score: 24, heartRate: 74, steps: 3980 },
  { label: '20/10', score: 21, heartRate: 71, steps: 4450 },
  { label: '21/10', score: 28, heartRate: 76, steps: 3420 },
  { label: '22/10', score: 25, heartRate: 73, steps: 4010 },
  { label: '23/10', score: 20, heartRate: 70, steps: 4680 },
  { label: '24/10', score: 19, heartRate: 72, steps: 4520 },
]

const THIRTY_DAY_TRENDS: TrendPoint[] = Array.from({ length: 30 }, (_, index) => {
  const day = index + 1
  const wave = Math.sin(index / 3.5)
  const score = Math.round(23 + wave * 6 + (index % 4 === 0 ? 2 : -1))
  const heartRate = Math.round(72 + wave * 4)
  const steps = Math.round(4100 - wave * 450 + (index % 3) * 140)

  return {
    label: `${String(day).padStart(2, '0')}/10`,
    score,
    heartRate,
    steps,
  }
})

function getTrendsByPeriod(period: TrendPeriod): TrendPoint[] {
  return period === '7d' ? SEVEN_DAY_TRENDS : THIRTY_DAY_TRENDS
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
