import { Request, Response } from 'express';
import { FailureObject } from '../util/error.util';
import { ErrorCode } from '../types/error.util';
import { TotalTraffic, Traffic } from '../types/traffic';

export class TrafficController {
  constructor(private trafficRepository: any) {}

  getTraffic = async (req: Request, res: Response) => {
    const date = req.query.date as string;
    const data = Traffic.parse({ userId: (req as any).userId, date: new Date(date) });
    const traffic: Traffic = await this.trafficRepository.findTraffic(data);
    res.status(200).json(traffic.toJson());
  };

  getTotalTraffic = async (req: Request, res: Response) => {
    const total: TotalTraffic = await this.trafficRepository.findTotalTraffic((req as any).userId);
    res.status(200).json(total.toJson());
  };

  createTraffic = async (req: Request, res: Response) => {
    const traffic = req.body;
    const data = Traffic.parse({ userId: (req as any).userId, ...traffic });
    await this.trafficRepository.createTraffic(data);
    res.sendStatus(201);
  };

  updateTraffic = async (req: Request, res: Response) => {
    const traffic = req.body;

    const data = Traffic.parse({ id: traffic.trafficId, userId: (req as any).userId, ...traffic });
    const result: Traffic = await this.trafficRepository.updateTraffic(data);
    if (!result.trafficId) {
      const failure = new FailureObject(ErrorCode.NOT_FOUND, 'Traffic not found', 404);
      throw failure;
    }
    res.sendStatus(204);
  };
}
