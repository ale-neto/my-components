import { Component } from '@angular/core';
import { ANCalendarioModule } from 'src/components/calendar';
import { EventModalComponent } from 'src/components/event-modal/event-modal';
import {
  ICalendarAction,
  ICalendarEvent,
} from '../../components/calendar/interfaces';

@Component({
  selector: 'app-home',
  imports: [ANCalendarioModule, EventModalComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent {
  eventActions: ICalendarAction[] = [
    {
      name: '👁️ Visualizar',
      method: (event: ICalendarEvent) => this.viewEventDetails(event),
    },
    {
      name: '✏️ Editar',
      method: (event: ICalendarEvent) => this.editEvent(event),
    },
    {
      name: '📋 Duplicar',
      method: (event: ICalendarEvent) => this.duplicateEvent(event),
    },
    {
      name: '🔗 Compartilhar',
      method: (event: ICalendarEvent) => this.shareEvent(event),
    },
    {
      name: '❌ Excluir',
      method: (event: ICalendarEvent) => this.deleteEvent(event),
    },
  ];

  events: ICalendarEvent[] = [
    {
      id: '1',
      title: 'Daily Stand-up',
      date: '2025-07-21',
      startTime: '09:00',
      endTime: '09:30',
      color: '#3b82f6',
      description: 'Reunião diária da equipe',
    },
    {
      id: '2',
      title: 'Code Review',
      date: '2025-07-21',
      startTime: '10:00',
      endTime: '11:30',
      color: '#8b5cf6',
      description: 'Revisão do código da nova funcionalidade',
    },
    {
      id: '3',
      title: 'Almoço Cliente',
      date: '2025-07-21',
      startTime: '12:00',
      endTime: '14:00',
      color: '#10b981',
      description: 'Reunião de negócios',
    },
    {
      id: '4',
      title: 'Apresentação Q2',
      date: '2025-07-21',
      startTime: '15:00',
      endTime: '16:30',
      color: '#f59e0b',
      description: 'Apresentação dos resultados',
    },
    {
      id: '5',
      title: 'Sprint Planning',
      date: '2025-07-22',
      startTime: '09:00',
      endTime: '12:00',
      color: '#ef4444',
      description: 'Planejamento do próximo sprint',
    },
    {
      id: '6',
      title: '1:1 com Manager',
      date: '2025-07-22',
      startTime: '14:00',
      endTime: '15:00',
      color: '#6366f1',
      description: 'Conversa individual',
    },
    {
      id: '7',
      title: 'Workshop React',
      date: '2025-07-23',
      startTime: '09:30',
      endTime: '12:30',
      color: '#8b5cf6',
      description: 'Workshop interno',
    },
    {
      id: '8',
      title: 'Dentista',
      date: '2025-07-23',
      startTime: '16:00',
      endTime: '17:00',
      color: '#06b6d4',
      description: 'Consulta odontológica',
    },
    {
      id: '9',
      title: 'Team Building',
      date: '2025-07-24',
      startTime: '14:00',
      endTime: '18:00',
      color: '#10b981',
      description: 'Atividade de integração',
    },
    {
      id: '10',
      title: 'Deploy Produção',
      date: '2025-07-25',
      startTime: '10:00',
      endTime: '12:00',
      color: '#ef4444',
      description: 'Deploy da nova versão',
    },
    // Eventos adicionais para demonstrar o mês
    {
      id: '11',
      title: 'Reunião Mensal',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      color: '#3b82f6',
      description: 'Reunião mensal da diretoria',
    },
    {
      id: '12',
      title: 'Treinamento',
      date: '2025-07-15',
      startTime: '14:00',
      endTime: '17:00',
      color: '#8b5cf6',
      description: 'Treinamento de novas tecnologias',
    },
    {
      id: '13',
      title: 'Retrospectiva',
      date: '2025-07-31',
      startTime: '15:00',
      endTime: '16:00',
      color: '#f59e0b',
      description: 'Retrospectiva do mês',
    },
  ];

  showEventModal: boolean = false;
  showToast: boolean = false;
  toastMessage: string = '';
  modalData: any = null;

  private addHoursToTime(time: string, hours: number): string {
    const [h, m] = time.split(':').map((n) => parseInt(n, 10));
    const newHour = (h + hours) % 24;
    return `${newHour.toString().padStart(2, '0')}:${m
      .toString()
      .padStart(2, '0')}`;
  }

  private getRandomColor(): string {
    const colors = [
      '#3b82f6',
      '#ef4444',
      '#10b981',
      '#f59e0b',
      '#8b5cf6',
      '#ec4899',
      '#06b6d4',
      '#84cc16',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private showToastMessage(message: string): void {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  onViewEvent(event: ICalendarEvent): void {
    console.log('Visualizando evento:', event);
    this.modalData = event;
    this.showEventModal = true;
  }

  viewEventDetails(event: ICalendarEvent): void {
    this.onViewEvent(event);
  }

  editEvent(event: any): void {
    console.log('Editando evento:', event);
    this.modalData = event;
    this.showEventModal = true;
    this.showToastMessage('✏️ Abrindo editor...');
  }

  duplicateEvent(event: ICalendarEvent): void {
    console.log('Duplicando evento:', event);

    const duplicated: ICalendarEvent = {
      ...event,
      id: Date.now().toString(),
      title: `${event.title} (Cópia)`,
      startTime: this.addHoursToTime(event.startTime, 1),
      endTime: this.addHoursToTime(event.endTime, 1),
    };

    this.events = [...this.events, duplicated];
    this.showToastMessage('📋 Evento duplicado!');
  }

  shareEvent(event: ICalendarEvent): void {
    console.log('Compartilhando evento:', event);

    const shareText = `📅 ${event.title}\n🗓️ ${event.date}\n⏰ ${event.startTime} - ${event.endTime}`;

    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: shareText,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      this.showToastMessage('🔗 Evento copiado para área de transferência!');
    }
  }

  deleteEvent(event: ICalendarEvent): void {
    if (confirm(`Tem certeza que deseja excluir "${event.title}"?`)) {
      this.events = this.events.filter((e) => e.id !== event.id);
      this.showToastMessage('❌ Evento excluído!');
    }
  }

  closeEventModal() {
    this.showEventModal = false;
    this.modalData = null;
  }
}
