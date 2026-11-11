import { Component, OnInit, inject, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { errorMessage } from '../../core/api-error';
import { fromDateInput, toDateInput } from '../../core/due';
import { ManagerStore } from '../../core/manager.store';
import { STATUS_OPTIONS, Video, VideoRequest, VideoStatus } from '../../core/models';

/** Modal zum Anlegen und Bearbeiten eines Videos. Speichert selbst über den Store. */
@Component({
  selector: 'app-video-form',
  imports: [ReactiveFormsModule],
  templateUrl: './video-form.html',
  host: { '(document:keydown.escape)': 'closed.emit()' },
})
export class VideoForm implements OnInit {
  private readonly store = inject(ManagerStore);

  readonly video = input<Video | null>(null);
  readonly initialStatus = input<VideoStatus>(1);
  readonly initialCreatorId = input<number | null>(null);
  readonly closed = output<void>();

  protected readonly creators = this.store.creators;
  protected readonly statusOptions = STATUS_OPTIONS;
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(200)],
    }),
    description: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(4000)] }),
    creatorId: new FormControl<number | null>(null, Validators.required),
    status: new FormControl<VideoStatus>(1, { nonNullable: true }),
    price: new FormControl<number | null>(0, [Validators.required, Validators.min(0)]),
    due: new FormControl('', { nonNullable: true }),
  });

  ngOnInit(): void {
    const video = this.video();
    if (video) {
      this.form.setValue({
        title: video.title,
        description: video.description ?? '',
        creatorId: video.creatorId,
        status: video.status,
        price: video.price,
        due: toDateInput(video.due),
      });
    } else {
      this.form.patchValue({
        status: this.initialStatus(),
        creatorId: this.initialCreatorId() ?? this.creators()[0]?.id ?? null,
      });
    }
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const video = this.video();
    const request: VideoRequest = {
      title: raw.title.trim(),
      description: raw.description.trim() || null,
      creatorId: raw.creatorId!,
      status: raw.status,
      price: raw.price ?? 0,
      due: fromDateInput(raw.due, video?.due),
    };

    this.saving.set(true);
    this.error.set(null);

    const save$ = video
      ? this.store.updateVideo(video.id, request)
      : this.store.createVideo(request);

    save$.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: () => this.closed.emit(),
      error: (err) => this.error.set(errorMessage(err)),
    });
  }
}
