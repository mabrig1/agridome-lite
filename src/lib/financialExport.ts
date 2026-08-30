'use client'

export interface ExportFinanceLog {
  type: 'Expense' | 'Revenue'
  category: string
  amount: number
  date: string | Date
  description?: string
}

export interface ExportFinanceSummary {
  expenses: number
  revenue: number
  netProfit: number
  marginPercent: number
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function csvEscape(value: unknown) {
  const text = String(value ?? '')
  return `"${text.replace(/"/g, '""')}"`
}

export function exportFinanceCsv(farmName: string, logs: ExportFinanceLog[]) {
  const rows = [
    ['Date', 'Type', 'Category', 'Amount', 'Description'],
    ...logs.map(log => [
      new Date(log.date).toISOString().slice(0, 10),
      log.type,
      log.category,
      Number(log.amount).toFixed(2),
      log.description ?? '',
    ]),
  ]

  const csv = rows.map(row => row.map(csvEscape).join(',')).join('\n')
  downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), `${farmName.replace(/\s+/g, '-').toLowerCase()}-ledger.csv`)
}

export async function exportFinancePdf(
  farmName: string,
  region: string,
  logs: ExportFinanceLog[],
  summary: ExportFinanceSummary
) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })

  doc.setFontSize(18)
  doc.text('AgriDome Lite Farm Finance Report', 40, 50)
  doc.setFontSize(11)
  doc.text(`Farm: ${farmName}`, 40, 75)
  doc.text(`Region: ${region}`, 40, 92)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 40, 109)

  doc.setFontSize(12)
  doc.text(`Revenue: ${summary.revenue.toFixed(2)}`, 40, 140)
  doc.text(`Expenses: ${summary.expenses.toFixed(2)}`, 40, 158)
  doc.text(`Net profit: ${summary.netProfit.toFixed(2)}`, 40, 176)
  doc.text(`Profit margin: ${summary.marginPercent.toFixed(1)}%`, 40, 194)

  let y = 228
  doc.setFontSize(10)
  doc.text('Date', 40, y)
  doc.text('Type', 105, y)
  doc.text('Category', 170, y)
  doc.text('Amount', 285, y)
  doc.text('Description', 360, y)
  y += 16

  for (const log of logs) {
    if (y > 770) {
      doc.addPage()
      y = 50
    }
    doc.text(new Date(log.date).toISOString().slice(0, 10), 40, y)
    doc.text(log.type, 105, y)
    doc.text(log.category.slice(0, 18), 170, y)
    doc.text(Number(log.amount).toFixed(2), 285, y)
    doc.text((log.description ?? '').slice(0, 30), 360, y)
    y += 15
  }

  doc.save(`${farmName.replace(/\s+/g, '-').toLowerCase()}-finance-report.pdf`)
}
