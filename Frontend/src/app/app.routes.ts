import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'todo' },
  {
    path: 'todo',
    title: 'Todo-Liste · VideoManager',
    loadComponent: () => import('./pages/todo/todo').then((m) => m.TodoPage),
  },
  {
    path: 'videos',
    title: 'Videos · VideoManager',
    loadComponent: () => import('./pages/videos/videos').then((m) => m.VideosPage),
  },
  {
    path: 'creators',
    title: 'Creator · VideoManager',
    loadComponent: () => import('./pages/creators/creators').then((m) => m.CreatorsPage),
  },
  { path: '**', redirectTo: 'todo' },
];
