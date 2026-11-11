import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable, finalize } from 'rxjs';
import { errorMessage } from '../../core/api-error';
import { ManagerStore } from '../../core/manager.store';
import { Creator, Video } from '../../core/models';

const MONEY = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });

function sumPrice(videos: readonly Video[]): number {
  return videos.reduce((sum, v) => sum + v.price, 0);
}

@Component({
  selector: 'app-creators-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './creators.html',
  styleUrl: './creators.scss',
})
export class CreatorsPage {
  protected readonly store = inject(ManagerStore);

  protected readonly newName = signal('');
  protected readonly editingId = signal<number | null>(null);
  protected readonly editName = signal('');
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly rows = computed(() => {
    const videos = this.store.videos();
    return [...this.store.creators()]
      .sort((a, b) => a.name.localeCompare(b.name, 'de'))
      .map((creator) => {
        const own = videos.filter((v) => v.creatorId === creator.id);
        return {
          creator,
          total: own.length,
          open: own.filter((v) => v.status !== 3).length,
          received: sumPrice(own.filter((v) => v.status === 3)),
          due: sumPrice(own.filter((v) => v.status !== 3)),
        };
      });
  });

  /** Gesamtübersicht über alle Creator: erhaltenes vs. noch fälliges Geld. */
  protected readonly totals = computed(() => {
    const videos = this.store.videos();
    return {
      received: sumPrice(videos.filter((v) => v.status === 3)),
      due: sumPrice(videos.filter((v) => v.status !== 3)),
    };
  });

  protected formatMoney(value: number): string {
    return MONEY.format(value);
  }

  protected create(): void {
    const name = this.newName().trim();
    if (!name) {
      return;
    }
    this.run(this.store.createCreator({ name }), () => this.newName.set(''));
  }

  protected startEdit(creator: Creator): void {
    this.error.set(null);
    this.editingId.set(creator.id);
    this.editName.set(creator.name);
  }

  protected saveEdit(creator: Creator): void {
    const name = this.editName().trim();
    if (!name || name === creator.name) {
      this.editingId.set(null);
      return;
    }
    this.run(this.store.updateCreator(creator.id, { name }), () => this.editingId.set(null));
  }

  protected remove(creator: Creator, videoCount: number): void {
    if (videoCount > 0) {
      this.error.set(
        `„${creator.name}“ hat noch ${videoCount} Video(s). Lösche oder verschiebe diese zuerst.`,
      );
      return;
    }
    if (!confirm(`Creator „${creator.name}“ wirklich löschen?`)) {
      return;
    }
    this.run(this.store.deleteCreator(creator.id));
  }

  protected initial(name: string): string {
    return name.trim().charAt(0).toUpperCase() || '?';
  }

  private run<T>(request: Observable<T>, onSuccess?: () => void): void {
    this.saving.set(true);
    this.error.set(null);
    request.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: () => onSuccess?.(),
      error: (err) => this.error.set(errorMessage(err)),
    });
  }
}
