import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class WeekViewStateService {

  private menuVisible$ = new BehaviorSubject<boolean>(false);

  get menuVisible(): Observable<boolean> {
    return this.menuVisible$.asObservable();
  }

  setMenuVisible(visible: boolean): void {
    this.menuVisible$.next(visible);
  }

  destroy(): void {
    this.menuVisible$.complete();
  }
}
