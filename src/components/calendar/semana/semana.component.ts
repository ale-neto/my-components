import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { ICalendarioEvento } from '../interfaces';

@Component({
  selector: 'app-visualizacao-semanal',
  templateUrl: './semana.component.html',
  styleUrls: ['./semana.component.scss'],
})
export class VisualizacaoSemanalComponent implements OnInit, OnChanges {
  @Input() eventos: ICalendarioEvento[] = [];
  @Input() periodoMarcadoParaEventos?: { dataInicial: string; dataFim: string };
  @Input() periodoDia: { inicio: number; fim: number; intervalo?: number } = {
    inicio: 0,
    fim: 23,
    intervalo: 60,
  };
  @Output() cliqueAdicionarEvento = new EventEmitter<{
    data: Date;
    horaInicio: string;
  }>();
  @Output() cliqueVisualizarEvento = new EventEmitter<any>();
  @Output() mesMudou = new EventEmitter<{ mes: string; ano: number }>();
  @Input() acoesEvento: { nome: string; metodo: (evento: any) => void }[] = [];
  private dataAtual: Date = new Date();
  menuVisivel = false;
  posicaoMenu = { top: '0px', left: '0px' };
  eventoSelecionado: any;
  diasSemana: { data: Date; eventos: ICalendarioEvento[] }[] = [];
  horas: string[] = [];
  diasMarcados: string[] = [];
  diaAtual!: string;

  constructor() {
    this.horas = this.gerarHoras(
      this.periodoDia.inicio,
      this.periodoDia.fim,
      this.periodoDia.intervalo || 60
    );
  }

  ngOnInit() {
    const { dataInicial, dataFim } = this.periodoMarcadoParaEventos || {};
    const agora = new Date();
    this.diaAtual = agora.toISOString().split('T')[0];
    this.dataAtual = dataInicial ? new Date(dataInicial + 'T00:00:00') : agora;

    if (dataInicial && dataFim) {
      this.marcarDiasEntre({ dataInicial, dataFim });
    }
    this.configurarDiasSemana();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['eventos']) {
      this.configurarDiasSemana();
    }
    if (changes['periodoDia']) {
      const periodo = changes['periodoDia'].currentValue;
      this.horas = this.gerarHoras(
        periodo?.inicio,
        periodo?.fim,
        periodo?.intervalo || 60
      );
    }

    if (changes['periodoMarcadoParaEventos']) {
      const { dataInicial, dataFim } =
        changes['periodoMarcadoParaEventos'].currentValue || {};
      if (dataInicial && dataFim) {
        this.marcarDiasEntre({ dataInicial, dataFim });
      }
    }
  }

  private marcarDiasEntre({
    dataInicial,
    dataFim,
  }: {
    dataInicial: string;
    dataFim: string;
  }): void {
    this.diasMarcados = [];

    const inicio = new Date(dataInicial);
    const fim = new Date(dataFim);

    const current = new Date(inicio);
    while (current <= fim) {
      this.diasMarcados.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
  }

  private emitirMudancaDeMes() {
    const mes = this.dataAtual.toLocaleString('pt-BR', { month: 'long' });
    const anoAtual = this.dataAtual.getFullYear();
    const mesAtual = mes.charAt(0).toUpperCase() + mes.slice(1);
    this.mesMudou.emit({ mes: mesAtual, ano: anoAtual });
  }

  private gerarHoras(horaInicio = 0, horaFim = 23, intervalo = 60): string[] {
    const horas: string[] = [];

    horaInicio = Math.max(0, Math.min(23, horaInicio));
    horaFim = Math.max(0, Math.min(23, horaFim));

    if (horaInicio > horaFim) {
      [horaInicio, horaFim] = [horaFim, horaInicio];
    }

    const incremento = intervalo / 60;

    for (let i = horaInicio; i <= horaFim; i += incremento) {
      const hora = Math.floor(i);
      const minutos = Math.round((i - hora) * 60);

      const horaStr = hora < 10 ? `0${hora}` : `${hora}`;
      const minutosStr = minutos < 10 ? `0${minutos}` : `${minutos}`;

      horas.push(`${horaStr}:${minutosStr}`);
    }

    return horas;
  }

  private configurarDiasSemana() {
    this.diasSemana = [];
    const primeiroDiaSemana = this.obterPrimeiroDiaSemana(this.dataAtual);

    for (let i = 0; i < 7; i++) {
      const dataAtual = new Date(primeiroDiaSemana);
      dataAtual.setDate(primeiroDiaSemana.getDate() + i);

      const eventosDoDia = this.filtrarEventosDoDia(dataAtual);

      this.calcularSobreposicoes(eventosDoDia);

      this.diasSemana.push({
        data: dataAtual,
        eventos: eventosDoDia,
      });
    }
  }

  private calcularSobreposicoes(eventos: ICalendarioEvento[]) {
    if (!eventos.length) return;

    const eventosAgrupados: { [key: string]: ICalendarioEvento[] } = {};

    for (const evento of eventos) {
      let grupoEncontrado = false;

      for (const grupo in eventosAgrupados) {
        if (this.verificarSobreposicao(evento, eventosAgrupados[grupo][0])) {
          eventosAgrupados[grupo].push(evento);
          grupoEncontrado = true;
          break;
        }
      }

      if (!grupoEncontrado) {
        const novoGrupoId = `grupo_${Object.keys(eventosAgrupados).length}`;
        eventosAgrupados[novoGrupoId] = [evento];
      }
    }

    for (const grupo in eventosAgrupados) {
      const eventosGrupo = eventosAgrupados[grupo];

      if (eventosGrupo.length > 1) {
        eventosGrupo.sort((a, b) => {
          return (
            this.converterHoraParaMinutos(a.horaInicio) -
            this.converterHoraParaMinutos(b.horaInicio)
          );
        });

        for (let i = 0; i < eventosGrupo.length; i++) {
          (eventosGrupo[i] as any).posicao = i;
          (eventosGrupo[i] as any).totalSobrepostos = eventosGrupo.length;
        }
      } else {
        (eventosGrupo[0] as any).posicao = 0;
        (eventosGrupo[0] as any).totalSobrepostos = 1;
      }
    }
  }

  private verificarSobreposicao(
    evento1: ICalendarioEvento,
    evento2: ICalendarioEvento
  ): boolean {
    const inicio1 = this.converterHoraParaMinutos(evento1.horaInicio);
    const fim1 = this.converterHoraParaMinutos(evento1.horaFim);
    const inicio2 = this.converterHoraParaMinutos(evento2.horaInicio);
    const fim2 = this.converterHoraParaMinutos(evento2.horaFim);

    return inicio1 < fim2 && fim1 > inicio2;
  }

  private converterHoraParaMinutos(hora: string): number {
    const [h, m] = hora.split(':').map((n) => parseInt(n, 10));
    return h * 60 + (m || 0);
  }

  private obterPrimeiroDiaSemana(data: Date): Date {
    const primeiroDia = new Date(data);
    primeiroDia.setDate(data.getDate() - data.getDay());
    return primeiroDia;
  }

  private filtrarEventosDoDia(dia: Date) {
    return this.eventos.filter((evento) => {
      const dataEvento = new Date(evento.data + 'T00:00:00');
      return dataEvento.toDateString() === dia.toDateString();
    });
  }

  verificarDiaMarcado(data: string): boolean {
    return this.diasMarcados.includes(data);
  }

  irParaSemanaAnterior() {
    this.dataAtual.setDate(this.dataAtual.getDate() - 7);
    this.configurarDiasSemana();
    this.emitirMudancaDeMes();
  }

  irParaSemanaAtual() {
    this.dataAtual = new Date();
    this.configurarDiasSemana();
    this.emitirMudancaDeMes();
  }

  irParaSemanaSeguinte() {
    this.dataAtual.setDate(this.dataAtual.getDate() + 7);
    this.configurarDiasSemana();
    this.emitirMudancaDeMes();
  }

  obterEstiloEvento(evento: any) {
    const horaInicio = parseInt(evento.horaInicio.split(':')[0], 10);
    const minutosInicio = parseInt(evento.horaInicio.split(':')[1], 10) || 0;
    const horaFim = parseInt(evento.horaFim.split(':')[0], 10);
    const minutosFim = parseInt(evento.horaFim.split(':')[1], 10) || 0;

    const horaMinima = this.periodoDia?.inicio || 0;

    const topoRelativo = horaInicio - horaMinima + minutosInicio / 60;
    const topo = topoRelativo * 50;

    const duracaoHoras =
      horaFim - horaInicio + (minutosFim - minutosInicio) / 60;
    const altura = duracaoHoras * 50;

    const largura = 100 / (evento.totalSobrepostos || 1);
    const esquerda = (evento.posicao || 0) * largura;

    return {
      top: `${topo}px`,
      height: `${altura}px`,
      backgroundColor: evento.cor || '#007bff',
      color: '#fff',
      borderRadius: '4px',
      padding: '5px',
      boxSizing: 'border-box',
      width: `${largura}%`,
      left: `${esquerda}%`,
    };
  }

  adicionarEvento(data: Date, horaInicio: string) {
    this.cliqueAdicionarEvento.emit({ data, horaInicio });
  }

  verificarMesmoDia(dia: string): boolean {
    return dia === this.diaAtual;
  }

  visualizarEvento(evento: any) {
    this.cliqueVisualizarEvento.emit(evento);
  }

  abrirMenu(event: MouseEvent, evento: any) {
    event.preventDefault();
    this.menuVisivel = true;
    this.eventoSelecionado = evento;
    this.posicaoMenu = {
      top: event.clientY + 'px',
      left: event.clientX + 'px',
    };
  }

  executarAcao(callback: (evento: any) => void) {
    callback(this.eventoSelecionado);
    this.menuVisivel = false;
  }

  fecharMenu() {
    this.menuVisivel = false;
  }
}
