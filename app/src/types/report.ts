export type ReportStatus = 'Submitted' | 'In review' | 'Assigned' | 'Resolved' | 'Rejected';

export interface Report {
  id: string | number;
  reference: string;
  title: string;
  location: string;
  status: ReportStatus;
  description?: string;
  photoUrl?: string;
  latitude?: number;
  longitude?: number;
  createdAt?: string;
  updated: string;
}

export interface ReportStatusStep {
  label: string;
  done: boolean;
  time?: string;
}

export interface CreateReportPayload {
  type: string;
  priority: string;
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  photoDataUrl?: string;
  capturedAt?: string;
}
