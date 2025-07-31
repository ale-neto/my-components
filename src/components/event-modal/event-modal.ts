import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface ModalData {
  title?: string | null;
  date?: Date | string | null;
  startTime?: string | null;
  endTime?: string | null;
  description?: string | null;
  color?: string | null;
}

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-event-modal',
  templateUrl: './event-modal.html',
})
export class EventModalComponent {
  @Input() show = false;
  @Input() modalData: ModalData = {};
  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<MouseEvent>();

  closeEventModal() {
    this.close.emit();
  }

  editEvent(event: MouseEvent) {
    this.edit.emit(event);
  }

  stopPropagation(event: Event) {
    event.stopPropagation();
  }
}
