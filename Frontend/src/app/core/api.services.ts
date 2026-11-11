import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Creator, CreatorRequest, Video, VideoRequest } from './models';

@Injectable({ providedIn: 'root' })
export class VideoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/videos';

  getAll(): Observable<Video[]> {
    return this.http.get<Video[]>(this.baseUrl);
  }

  create(request: VideoRequest): Observable<Video> {
    return this.http.post<Video>(this.baseUrl, request);
  }

  update(id: number, request: VideoRequest): Observable<Video> {
    return this.http.put<Video>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class CreatorService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/creators';

  getAll(): Observable<Creator[]> {
    return this.http.get<Creator[]>(this.baseUrl);
  }

  create(request: CreatorRequest): Observable<Creator> {
    return this.http.post<Creator>(this.baseUrl, request);
  }

  update(id: number, request: CreatorRequest): Observable<Creator> {
    return this.http.put<Creator>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
