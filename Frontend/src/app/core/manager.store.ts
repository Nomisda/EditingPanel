import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, finalize, forkJoin, tap } from 'rxjs';
import { CreatorService, VideoService } from './api.services';
import { errorMessage } from './api-error';
import { Creator, CreatorRequest, Video, VideoRequest, VideoStatus, toVideoRequest } from './models';

/** Hält Videos und Creator zentral, damit alle Seiten denselben Stand sehen. */
@Injectable({ providedIn: 'root' })
export class ManagerStore {
  private readonly videoApi = inject(VideoService);
  private readonly creatorApi = inject(CreatorService);

  readonly videos = signal<Video[]>([]);
  readonly creators = signal<Creator[]>([]);
  readonly loading = signal(false);
  readonly loaded = signal(false);
  readonly error = signal<string | null>(null);

  private readonly creatorNames = computed(
    () => new Map(this.creators().map((c) => [c.id, c.name])),
  );

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({ videos: this.videoApi.getAll(), creators: this.creatorApi.getAll() })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ videos, creators }) => {
          this.videos.set(videos);
          this.creators.set(creators);
          this.loaded.set(true);
        },
        error: (err) => this.error.set(errorMessage(err)),
      });
  }

  creatorName(id: number): string {
    return this.creatorNames().get(id) ?? `Creator #${id}`;
  }

  createVideo(request: VideoRequest): Observable<Video> {
    return this.videoApi
      .create(request)
      .pipe(tap((video) => this.videos.update((list) => [...list, video])));
  }

  updateVideo(id: number, request: VideoRequest): Observable<Video> {
    return this.videoApi
      .update(id, request)
      .pipe(tap((video) => this.videos.update((list) => list.map((v) => (v.id === id ? video : v)))));
  }

  /** Behält das Fälligkeitsdatum bei – ohne Due würde das Backend es auf "in 3 Tagen" zurücksetzen. */
  setStatus(video: Video, status: VideoStatus): Observable<Video> {
    return this.updateVideo(video.id, { ...toVideoRequest(video), status });
  }

  deleteVideo(id: number): Observable<void> {
    return this.videoApi
      .delete(id)
      .pipe(tap(() => this.videos.update((list) => list.filter((v) => v.id !== id))));
  }

  createCreator(request: CreatorRequest): Observable<Creator> {
    return this.creatorApi
      .create(request)
      .pipe(tap((creator) => this.creators.update((list) => [...list, creator])));
  }

  updateCreator(id: number, request: CreatorRequest): Observable<Creator> {
    return this.creatorApi
      .update(id, request)
      .pipe(
        tap((creator) => this.creators.update((list) => list.map((c) => (c.id === id ? creator : c)))),
      );
  }

  deleteCreator(id: number): Observable<void> {
    return this.creatorApi
      .delete(id)
      .pipe(tap(() => this.creators.update((list) => list.filter((c) => c.id !== id))));
  }
}
