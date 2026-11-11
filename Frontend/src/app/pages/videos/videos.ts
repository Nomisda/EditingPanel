import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { errorMessage } from '../../core/api-error';
import { dueState } from '../../core/due';
import { ManagerStore } from '../../core/manager.store';
import { STATUS_OPTIONS, Video, VideoStatus, statusOption } from '../../core/models';
import { VideoForm } from '../../shared/video-form/video-form';

type SortKey = 'title' | 'creator' | 'status' | 'due' | 'price';

@Component({
  selector: 'app-videos-page',
  imports: [DatePipe, FormsModule, VideoForm],
  templateUrl: './videos.html',
  styleUrl: './videos.scss',
})
export class VideosPage {
  protected readonly store = inject(ManagerStore);
  protected readonly statusOptions = STATUS_OPTIONS;
  protected readonly statusOption = statusOption;
  protected readonly dueState = dueState;

  /** Query-Parameter ?creator=<id>, z. B. von der Creator-Seite. */
  readonly creator = input<string>();

  protected readonly search = signal('');
  protected readonly statusFilter = signal<VideoStatus | null>(null);
  protected readonly creatorFilter = linkedSignal<number | null>(() => {
    const id = Number(this.creator());
    return Number.isInteger(id) && id > 0 ? id : null;
  });
  protected readonly sortKey = signal<SortKey>('due');
  protected readonly sortAsc = signal(true);

  protected readonly editing = signal<Video | null>(null);
  protected readonly creating = signal(false);
  protected readonly actionError = signal<string | null>(null);

  protected readonly rows = computed(() => {
    const term = this.search().trim().toLowerCase();
    const status = this.statusFilter();
    const creatorId = this.creatorFilter();
    const key = this.sortKey();
    const direction = this.sortAsc() ? 1 : -1;

    return this.store
      .videos()
      .filter((v) => status === null || v.status === status)
      .filter((v) => creatorId === null || v.creatorId === creatorId)
      .filter(
        (v) =>
          !term ||
          v.title.toLowerCase().includes(term) ||
          (v.description ?? '').toLowerCase().includes(term),
      )
      .sort((a, b) => this.compare(a, b, key) * direction);
  });

  protected sortBy(key: SortKey): void {
    if (this.sortKey() === key) {
      this.sortAsc.update((asc) => !asc);
    } else {
      this.sortKey.set(key);
      this.sortAsc.set(true);
    }
  }

  protected sortIndicator(key: SortKey): string {
    if (this.sortKey() !== key) {
      return '';
    }
    return this.sortAsc() ? '▲' : '▼';
  }

  protected changeStatus(video: Video, status: VideoStatus): void {
    this.actionError.set(null);
    this.store.setStatus(video, status).subscribe({
      error: (err) => this.actionError.set(errorMessage(err)),
    });
  }

  protected remove(video: Video): void {
    if (!confirm(`„${video.title}“ wirklich löschen?`)) {
      return;
    }
    this.actionError.set(null);
    this.store.deleteVideo(video.id).subscribe({
      error: (err) => this.actionError.set(errorMessage(err)),
    });
  }

  protected resetFilters(): void {
    this.search.set('');
    this.statusFilter.set(null);
    this.creatorFilter.set(null);
  }

  private compare(a: Video, b: Video, key: SortKey): number {
    switch (key) {
      case 'title':
        return a.title.localeCompare(b.title, 'de');
      case 'creator':
        return this.store.creatorName(a.creatorId).localeCompare(this.store.creatorName(b.creatorId), 'de');
      case 'status':
        return a.status - b.status;
      case 'price':
        return a.price - b.price;
      case 'due':
        return new Date(a.due).getTime() - new Date(b.due).getTime();
    }
  }
}
