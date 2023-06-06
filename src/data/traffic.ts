import Mongoose from 'mongoose';
import { MongoDB } from '../database/mongo';
import { Traffic, TotalTraffic } from '../types/traffic';

const trafficSchema = new Mongoose.Schema({
  userId: { type: String, required: true },
  trafficId: { type: String, unique: true },
  view: { type: Number, required: true, default: 0 },
  date: { type: String, required: true },
});

trafficSchema.index({ userId: 1, date: 1 });

MongoDB.useVirtualId(trafficSchema);
MongoDB.pre(trafficSchema, 'trafficId');
const TrafficModel = Mongoose.model('Traffic', trafficSchema);

export async function createTraffic(traffic: Traffic) {
  const result = await TrafficModel.create(traffic);
  return result.id;
}

export async function updateTraffic(traffic: Traffic) {
  const result = await TrafficModel.findOneAndUpdate({ userId: traffic.userId, date: traffic.date }, traffic, {
    returnOriginal: false,
  });
  return Traffic.parse(result);
}

export async function findTraffic(traffic: Traffic) {
  const result = await TrafficModel.findOne({
    userId: traffic.userId,
    date: traffic.date,
  });
  return Traffic.parse(result);
}

export async function findTotalTraffic(userId: string) {
  const result = await TrafficModel.aggregate([
    {
      $match: {
        userId,
      },
    },
    { $project: { total: { $sum: '$view' } } },
  ]);
  return TotalTraffic.parse(result[0]);
}
