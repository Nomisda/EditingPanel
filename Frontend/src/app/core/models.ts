export type VideoStatus = 1 | 2 | 3;

export interface Video {
  id: number;
  title: string;
  description: string | null;
  creatorId: number;
  status: VideoStatus;
  price: number;
  due: string;
}

export interface VideoRequest {
  title: string;
  description: string | null;
  creatorId: number;
  status: VideoStatus;
  price: number;
  /** null = Backend setzt "in 3 Tagen" als Standard */
  due: string | null;
}

export interface Creator {
  id: number;
  name: string;
}

export interface CreatorRequest {
  name: string;
}

export interface StatusOption {
  value: VideoStatus;
  label: string;
  key: 'todo' | 'progress' | 'done';
}

export const STATUS_OPTIONS: readonly StatusOption[] = [
  { value: 1, label: 'To-Do', key: 'todo' },
  { value: 2, label: 'In Arbeit', key: 'progress' },
  { value: 3, label: 'Erledigt', key: 'done' },
];

export function statusOption(status: VideoStatus): StatusOption {
  return STATUS_OPTIONS.find((s) => s.value === status) ?? STATUS_OPTIONS[0];
}

export function toVideoRequest(video: Video): VideoRequest {
  return {
    title: video.title,
    description: video.description,
    creatorId: video.creatorId,
    status: video.status,
    price: video.price,
    due: video.due,
  };
}
