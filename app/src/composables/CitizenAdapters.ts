// ─────────────────────────────────────────────────────────────────────────────────────────────────
// Adapters for citizen report responses and routes.
// ─────────────────────────────────────────────────────────────────────────────────────────────────
import { reportsApi } from '../api/reports.api'
import type { Report } from '../types/report'
import { REPORT_STATES, type CitizenReport, type ReportState, type StatusEvent } from '../helpers/reportStatus'

export function errorCode(e: unknown): string | undefined {
  return typeof e === 'object' && e !== null && 'code' in e ? String((e as { code: unknown }).code) : undefined
}

function offlineError(): Error {
  const err = new Error('Network unavailable')
  ;(err as Error & { code: string }).code = 'NETWORK'
  return err
}

/** Report API status → citizen journey state (SRS FR-013.1). Rejected has no citizen state; stays SUBMITTED. */
function toState(status: Report['status']): ReportState {
  switch (status) {
    case 'In review':
      return 'VERIFIED'
    case 'Assigned':
      return 'ASSIGNED'
    case 'Resolved':
      return 'RESOLVED'
    case 'Rejected':
      return 'SUBMITTED'
    case 'Submitted':
    default:
      return 'SUBMITTED'
  }
}

/** Synthesises the step history leading up to `state` from created/updated timestamps. */
function historyUpTo(state: ReportState, createdAt?: string, updated?: string): StatusEvent[] {
  const reached = REPORT_STATES.slice(0, REPORT_STATES.indexOf(state) + 1)
  return reached.map((s, i) => ({
    state: s,
    at: i === reached.length - 1 ? (updated ?? createdAt ?? '') : (createdAt ?? ''),
  }))
}

function mapReport(report: Report): CitizenReport {
  const state = toState(report.status)
  return {
    reference: report.reference,
    state,
    history: historyUpTo(state, report.createdAt, report.updated),
    beforePhoto: report.photoUrl ?? null,
    afterPhoto: state === 'RESOLVED' ? (report.photoUrl ?? null) : null,
    resolvedAt: state === 'RESOLVED' ? (report.updated || null) : null,
    address: report.location,
    clusteredWithExisting: false,
  }
}

/**
 * Load one report by its reference. Returns null when the API confirms it does
 * not exist; connection and server errors are allowed to reach the caller.
 */
export async function fetchReportByReference(reference: string): Promise<CitizenReport | null> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) throw offlineError()
  if (!reference) return null
  const list = await reportsApi.list()
  const found = list.find((r) => r.reference === reference)
  return found ? mapReport(found) : null
}

// [CHECK] Where each button goes. Compare with router/routes/citizen.routes.ts and use your route names/paths.
export const trackReportRoute = (reference: string): string => `/citizen/reports/${encodeURIComponent(reference)}`
export const resolvedRoute = (reference: string): string => `/citizen/reports/${encodeURIComponent(reference)}/resolved`
export const newReportRoute = (): string => '/citizen/report-new'
export const myReportsRoute = (): string => '/citizen/reports'
