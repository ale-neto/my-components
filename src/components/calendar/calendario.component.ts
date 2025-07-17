import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ICalendarEvent } from './interfaces';
import { VisualizacaoMensalComponent } from './mes';
import { WeekViewComponent } from './semana';

@Component({
  standalone: false,
  selector: 'app-calendar',
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarioComponent implements OnChanges, OnInit {
  @ViewChild(VisualizacaoMensalComponent)
  mesComponent!: VisualizacaoMensalComponent;
  @ViewChild(WeekViewComponent)
  semanaComponent!: WeekViewComponent;
  @Input() viewMode: 'mes' | 'semana' = 'semana';
  @Input() eventos: ICalendarEvent[] = [];
  @Input() desabilitarAdicionarEvento = false;
  @Input() desabilitarIrParaProximoMes = false;
  @Input() desabilitarIrParaMesAnterior = false;
  @Input() configPeriodoDiaSemana!: {
    inicio: number;
    fim: number;
    intervalo?: number;
  };
  @Input() periodoMarcadoParaEventos!: { dataInicial: string; dataFim: string };
  @Input() acoesEvento: { nome: string; metodo: (evento: any) => void }[] = [];
  @Output() cliqueAdicionarEvento = new EventEmitter<{ data: Date }>();
  @Output() cliqueVisualizarEvento = new EventEmitter<ICalendarEvent>();
  mesAtual: string = '';
  anoAtual: number = 0;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    const referencia = this.periodoMarcadoParaEventos?.dataInicial
      ? new Date(this.periodoMarcadoParaEventos?.dataInicial + 'T00:00:00')
      : new Date();

    const nomeMes = referencia.toLocaleString('pt-BR', { month: 'long' });
    this.mesAtual = nomeMes.toUpperCase();
    this.anoAtual = referencia.getFullYear();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes['eventos'] ||
      changes['configPeriodoDiaSemana'] ||
      changes['periodoMarcadoParaEventos']
    ) {
      this.cdr.markForCheck();
    }
  }

  mudarVisao(tipo: 'semana' | 'mes') {
    const referencia = this.periodoMarcadoParaEventos?.dataInicial
      ? new Date(this.periodoMarcadoParaEventos?.dataInicial + 'T00:00:00')
      : new Date();

    const nomeMes = referencia.toLocaleString('pt-BR', { month: 'long' });
    this.mesAtual = nomeMes.toUpperCase();
    this.anoAtual = referencia.getFullYear();
    this.viewMode = tipo;
  }

  getCurrentMonth(): string {
    return new Date().toLocaleString('pt-BR', { month: 'long' }).toUpperCase();
  }

  goToPreviousWeek() {
    this.semanaComponent.goPreviousWeek();
  }

  goToNextWeek() {
    this.semanaComponent.goNextWeek();
  }

  goToPreviousMonth() {
    this.mesComponent.irParaMesAnterior();
  }

  goToNextMonth() {
    this.mesComponent.irParaProximoMes();
  }

  goToCurrentWeek() {
    this.semanaComponent.goCurrentWeek();
  }

  goToCurrentMonth() {
    this.mesComponent.irParaMesAtual();
  }

  atualizarMes(evento: { mes: string; ano: number }) {
    this.mesAtual = evento.mes.toUpperCase();
    this.anoAtual = evento.ano;
  }
}
