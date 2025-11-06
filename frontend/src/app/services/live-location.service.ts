// src/app/live-location.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LiveLocationService {
  connect(uid: string): Observable<any> {
    return new Observable(sub => {
      const ws = new WebSocket(`ws://localhost:8000/locations/ws/${uid}`);
      ws.onmessage = evt => sub.next(JSON.parse(evt.data));
      ws.onerror = err => sub.error(err);
      ws.onclose = () => sub.complete();
      return () => ws.close();
    });
  }

  async getLatest(uid: string) {
    const res = await fetch(`http://localhost:8000/locations/${uid}`);
    if (!res.ok) throw new Error('Not found');
    return res.json();
  }
}
