// src/app/location-uploader.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LocationUploaderService {
  private api = 'http://localhost:8000/locations';
  async sendUpdate(p: { uid: string; lat: number; lng: number; accuracy?: number; speed?: number; heading?: number }) {
    const res = await fetch(this.api, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify(p)
    });
    if (!res.ok) throw new Error(`Update failed: ${res.status}`);
  }
}
