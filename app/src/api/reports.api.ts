import { api } from './http';
import type { ApiResponse } from '../types/api';
import type { Report, ReportStatus, CreateReportPayload } from '../types/report';

interface BackendReport {
  id?: string;
  reference: string;
  issueType?: string;
  status: string;
  zone?: string | null;
  note?: string | null;
  photoUrl?: string;
  lat?: number;
  lng?: number;
  createdAt?: string;
  updatedAt?: string;
}

function responseData<T>(response: ApiResponse<T>): T {
  if (!response.success || response.data === undefined) {
    throw new Error(response.error?.message || 'The API returned no report data.');
  }
  return response.data;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'error' in error) {
    const message = (error as ApiResponse).error?.message;
    if (message) return message;
  }
  return 'Could not submit the report.';
}

function mapStatus(status: string): ReportStatus {
  switch (status.toLowerCase()) {
    case 'verified':
      return 'In review';
    case 'assigned':
    case 'in_progress':
      return 'Assigned';
    case 'resolved':
      return 'Resolved';
    case 'rejected':
      return 'Rejected';
    default:
      return 'Submitted';
  }
}

function mapReport(report: BackendReport): Report {
  const title = report.issueType
    ? report.issueType
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    : 'Report';

  return {
    id: report.id ?? report.reference,
    reference: report.reference,
    title,
    location:
      report.zone ??
      (report.lat !== undefined && report.lng !== undefined
        ? `${report.lat}, ${report.lng}`
        : 'Location unavailable'),
    status: mapStatus(report.status),
    description: report.note ?? undefined,
    photoUrl: report.photoUrl,
    latitude: report.lat,
    longitude: report.lng,
    createdAt: report.createdAt,
    updated: report.updatedAt ?? report.createdAt ?? '',
  };
}

export const reportsApi = {
  async list(): Promise<Report[]> {
    const data = responseData(
      await api.get<BackendReport[]>('/reports/mine'),
    );
    return data.map(mapReport);
  },

  async get(reference: string | number): Promise<Report> {
    const data = responseData(
      await api.get<BackendReport>(`/reports/${encodeURIComponent(String(reference))}`),
    );
    return mapReport(data);
  },

  async create(payload: CreateReportPayload): Promise<Report> {
    if (!payload.photoDataUrl) {
      throw new Error('A report photo is required.');
    }
    if (payload.latitude === undefined || payload.longitude === undefined) {
      throw new Error('Allow location access to submit this report.');
    }

    const photo = await fetch(payload.photoDataUrl).then((response) =>
      response.blob(),
    );
    const issueType =
      payload.type === 'dumping' || payload.type === 'illegal_dumping'
        ? 'illegal_dumping'
        : 'missed_collection';
    const formData = new FormData();
    formData.append('photo', photo, 'report.jpg');
    formData.append('issueType', issueType);
    formData.append('lat', String(payload.latitude));
    formData.append('lng', String(payload.longitude));
    formData.append(
      'capturedAt',
      payload.capturedAt ?? new Date().toISOString(),
    );
    if (payload.description.trim()) {
      formData.append('note', payload.description.trim());
    }

    try {
      const response = await api.post<BackendReport>('/reports', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const report = responseData(response);
      return mapReport({
        ...report,
        issueType,
        zone: report.zone ?? (payload.location || undefined),
        lat: report.lat ?? payload.latitude,
        lng: report.lng ?? payload.longitude,
      });
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};

export default reportsApi;
