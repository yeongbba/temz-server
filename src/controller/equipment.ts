import { Request, Response } from 'express';
import { FailureObject } from '../util/error.util';
import { ErrorCode } from '../types/error.util';
import { Filter } from '../types/common';
import { Equipment } from '../types/equipment';
import { User } from '../types/auth';

export class EquipmentController {
  constructor(private equipmentRepository: any, private userRepository: any) {}

  getMyEquipment = async (req: Request, res: Response) => {
    const equipment: Equipment = await this.equipmentRepository.findMyEquipment((req as any).userId);
    res.status(200).json({ equipment });
  };

  getEquipments = async (req: Request, res: Response) => {
    const limit = req.query.limit as string;
    const skip = req.query.skip as string;
    const keywords = (req.query.keywords as string)?.split(' ').join('|');
    const useKeywords = !!req.query.keywords;
    const type = req.query.type as string;
    const brand = req.query.brand as string;
    const model = req.query.model as string;
    const condition = {
      type: keywords ? new RegExp(`${keywords}`, 'gi') : new RegExp(`${type}`, 'gi'),
      brand: keywords ? new RegExp(`${keywords}`, 'gi') : new RegExp(`${brand}`, 'gi'),
      model: keywords ? new RegExp(`${keywords}`, 'gi') : new RegExp(`${model}`, 'gi'),
    };

    const filter = Filter.parse({ limit, skip, condition });
    const equipments: Equipment[] = await this.equipmentRepository.findMyEquipment(filter, useKeywords);
    res.status(200).json({ equipments: equipments.map((equipment) => equipment.toJson()) });
  };

  createEquipment = async (req: Request, res: Response) => {
    const equipment = req.body;

    const user: User = await this.userRepository.findById((req as any).userId);
    if (!user.userId) {
      const failure = new FailureObject(ErrorCode.NOT_FOUND, 'User not found', 404);
      throw failure;
    }

    const data = Equipment.parse({
      userId: user.userId,
      userName: user.name,
      userImage: user.profile?.image,
      ...equipment,
    });
    await this.equipmentRepository.createEquipment(data);
    res.sendStatus(201);
  };

  updateEquipment = async (req: Request, res: Response) => {
    const equipment = req.body;

    const data = Equipment.parse({ id: equipment.equipmentId, userId: (req as any).userId, ...equipment });
    const result: Equipment = await this.equipmentRepository.updateEquipment(data);
    if (!result.equipmentId) {
      const failure = new FailureObject(ErrorCode.NOT_FOUND, 'Equipment not found', 404);
      throw failure;
    }
    res.sendStatus(204);
  };

  removeEquipment = async (req: Request, res: Response) => {
    const result: Equipment = await this.equipmentRepository.removeEquipment((req as any).userId);
    if (!result.equipmentId) {
      const failure = new FailureObject(ErrorCode.NOT_FOUND, 'Equipment not found', 404);
      throw failure;
    }
    res.sendStatus(204);
  };
}
