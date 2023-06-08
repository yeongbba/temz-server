import Mongoose from 'mongoose';
import { MongoDB } from '../database/mongo';
import { Equipment } from '../types/equipment';
import { Filter } from '../types/common';

const equipmentDetailSchema = new Mongoose.Schema({
  brand: { type: String, required: true, index: true },
  model: { type: String, required: true, index: true },
  sex: { type: String, required: false },
  hand: { type: String, required: false },
  year: { type: String, required: true },
  length: { type: Number, required: false },
  cover: { type: Boolean, required: true },
  purchaseInfo: { type: String, required: true },
  headSpec: { type: String, required: false },
  loftAngle: { type: Number, required: false },
  headVolume: { type: Number, required: false },
  headImport: { type: String, required: false },
  shaftSpec: { type: String, required: false },
  stiffness: { type: Number, required: false },
  flex: { type: Number, required: false },
  weight: { type: Number, required: false },
  torque: { type: Number, required: false },
  shaftImport: { type: String, required: false },
  images: [{ type: String, required: false }],
});

const equipmentListSchema = new Mongoose.Schema({
  type: { type: String, required: true },
  list: [equipmentDetailSchema],
});

const equipmentSchema = new Mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userImage: { type: String, required: false },
  equipment: [{ type: equipmentListSchema, index: true }],
});

equipmentSchema.index({ userId: 1 });
equipmentListSchema.index({
  'type': 1,
  'list.brand': 1,
  'list.model': 1,
});

MongoDB.useVirtualId(equipmentSchema);
MongoDB.pre(equipmentSchema, 'equipmentId');
export const EquipmentModel = Mongoose.model('Equipment', equipmentSchema);

export async function createEquipment(equipment: Equipment) {
  const result = await EquipmentModel.create(equipment);
  return result.id;
}

export async function updateEquipment(equipment: Equipment) {
  const result = await EquipmentModel.findOneAndUpdate({ userId: equipment.userId }, equipment, {
    returnOriginal: false,
  });
  return Equipment.parse(result);
}

export async function findMyEquipment(userId: string) {
  const result = await EquipmentModel.findOne({ userId });
  return Equipment.parse(result);
}

export async function findEquipments(filter: Filter, useKeywords: boolean) {
  const parentSchema = `equipment.list`;
  const condition = {};

  const entries = Object.entries(filter.condition);
  if (useKeywords) {
    const or = [];
    for (const [key, value] of entries) {
      const field = {};
      if (key === 'type') {
        field[`equipment.${key}`] = value;
      } else {
        field[`${parentSchema}.${key}`] = value;
      }
      or.push(field);
    }
    condition['$or'] = or;
  } else {
    for (const [key, value] of entries) {
      if (key === 'type') {
        condition[`equipment.${key}`] = value;
      } else {
        condition[`${parentSchema}.${key}`] = value;
      }
      condition[`${parentSchema}.${key}`] = value;
    }
  }

  const result = await EquipmentModel.find(condition, null, filter.toJson());
  return result?.map((equipment) => Equipment.parse(equipment));
}

export async function removeEquipment(userId: string) {
  const result = await EquipmentModel.findOneAndRemove({ userId }, { returnOriginal: false });
  return Equipment.parse(result);
}
