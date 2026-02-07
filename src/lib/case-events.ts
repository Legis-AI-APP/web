export type CaseEventType = "MOVEMENT" | "DOCUMENT" | "DATE" | "NOTE";
export type CaseEventStatus = "PENDING" | "DONE" | "URGENT" | "SCHEDULED";

export interface CaseEventDto {
  id: string;
  title: string;
  description: string;
  type?: CaseEventType | null;
  status?: CaseEventStatus | null;
  event_at?: string | null;
  file_urls: string[];
  created_at: string;
}
