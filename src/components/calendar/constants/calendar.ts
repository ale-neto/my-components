// calendar.constants.ts
export const CALENDAR_CONSTANTS = {
  DAYS_IN_WEEK: 7,
  HOUR_HEIGHT_PX: 50,
  MINUTES_IN_HOUR: 60,
  MS_IN_DAY: 24 * 60 * 60 * 1000,
  DEFAULT_INTERVAL: 60,
  MIN_HOUR: 0,
  MAX_HOUR: 23,
  DEFAULT_EVENT_COLOR: '#007bff',
  EVENT_BORDER_RADIUS: '4px',
  EVENT_PADDING: '5px',
} as const;

export const TIME_INTERVALS = [15, 30, 60] as const;

export const CALENDAR_THEMES = {
  DEFAULT: {
    backgroundColor: '#007bff',
    textColor: '#fff',
    borderRadius: '4px',
  },
  SUCCESS: {
    backgroundColor: '#28a745',
    textColor: '#fff',
    borderRadius: '4px',
  },
  WARNING: {
    backgroundColor: '#ffc107',
    textColor: '#000',
    borderRadius: '4px',
  },
  DANGER: {
    backgroundColor: '#dc3545',
    textColor: '#fff',
    borderRadius: '4px',
  },
} as const;
