export class Traffic {
  trafficId?: string;
  userId?: string;
  view?: number;
  date?: string;

  constructor(traffic?: { id?: string; userId?: string; view?: number; date: string }) {
    this.trafficId = traffic?.id;
    this.userId = traffic?.userId;
    this.view = traffic?.view;
    this.date = traffic?.date;
  }

  static parse(raw: any) {
    const traffic = new Traffic(raw);
    return traffic;
  }

  toJson() {
    return {
      trafficId: this.trafficId || null,
      view: this.view || 0,
      date: this.date || null,
    };
  }
}

export class TotalTraffic {
  userId?: string;
  total?: number;

  constructor(traffic?: { userId?: string; total?: number }) {
    this.userId = traffic?.userId;
    this.total = traffic?.total;
  }

  static parse(raw: any) {
    const traffic = new TotalTraffic(raw);
    return traffic;
  }

  toJson() {
    return {
      total: this.total || 0,
    };
  }
}
