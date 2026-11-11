import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { errorMessage } from '../../core/api-error';
import { byDue, dueState } from '../../core/due';
import { ManagerStore } from '../../core/manager.store';
import { STATUS_OPTIONS, Video, VideoStatus } from '../../core/models';
import { VideoForm } from '../../shared/video-form/video-form';

@Component({
  selector: 'app-todo-page',
  imports: [DatePipe, FormsModule, VideoForm],
  templateUrl: './todo.html',
  styleUrl: './todo.scss',
})
export class TodoPage {
  protected readonly store = inject(ManagerStore);
  protected readonly dueState = dueState;

  protected readonly creatorFilter = signal<number | null>(null);
  protected readonly editing = signal<Video | null>(null);
  protected readonly creatingStatus = signal<VideoStatus | null>(null);
  protected readonly actionError = signal<string | null>(null);
  protected readonly busyIds = signal<ReadonlySet<number>>(new Set());
  protected readonly dragOver = signal<VideoStatus | null>(null);
  private draggedId: number | null = null;

  private readonly filtered = computed(() => {
    const creatorId = this.creatorFilter();
    return this.store.videos().filter((v) => creatorId === null || v.creatorId === creatorId);
  });

  protected readonly columns = computed(() =>
    STATUS_OPTIONS.map((option) => ({
      ...option,
      videos: this.filtered()
        .filter((v) => v.status === option.value)
        .sort(byDue),
    })),
  );

  protected readonly stats = computed(() => {
    const videos = this.filtered();
    const done = videos.filter((v) => v.status === 3).length;
    return {
      total: videos.length,
      overdue: videos.filter((v) => dueState(v) === 'overdue').length,
      soon: videos.filter((v) => dueState(v) === 'soon').length,
      progress: videos.length ? Math.round((done / videos.length) * 100) : 0,
    };
  });

  protected moveBy(video: Video, delta: number): void {
    const next = video.status + delta;
    if (next >= 1 && next <= 3) {
      this.move(video, next as VideoStatus);
    }
  }

  protected move(video: Video, status: VideoStatus): void {
    if (video.status === status || this.busyIds().has(video.id)) {
      return;
    }
    this.setBusy(video.id, true);
    this.actionError.set(null);
    this.store
      .setStatus(video, status)
      .pipe(finalize(() => this.setBusy(video.id, false)))
      .subscribe({ error: (err) => this.actionError.set(errorMessage(err)) });
  }

  protected remove(video: Video): void {
    if (!confirm(`„${video.title}“ wirklich löschen?`)) {
      return;
    }
    this.setBusy(video.id, true);
    this.actionError.set(null);
    this.store
      .deleteVideo(video.id)
      .pipe(finalize(() => this.setBusy(video.id, false)))
      .subscribe({ error: (err) => this.actionError.set(errorMessage(err)) });
  }

  protected onDragStart(event: DragEvent, video: Video): void {
    this.draggedId = video.id;
    event.dataTransfer?.setData('text/plain', String(video.id));
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  protected onDragOver(event: DragEvent, status: VideoStatus): void {
    event.preventDefault();
    this.dragOver.set(status);
  }

  protected onDragLeave(event: DragEvent): void {
    const column = event.currentTarget as HTMLElement;
    if (!column.contains(event.relatedTarget as Node | null)) {
      this.dragOver.set(null);
    }
  }

  protected onDrop(event: DragEvent, status: VideoStatus): void {
    event.preventDefault();
    this.dragOver.set(null);
    const video = this.store.videos().find((v) => v.id === this.draggedId);
    this.draggedId = null;
    if (video) {
      this.move(video, status);
    }
  }

  private setBusy(id: number, busy: boolean): void {
    this.busyIds.update((ids) => {
      const next = new Set(ids);
      if (busy) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }
}
