export class Equipment {
  equipmentId?: string;
  userId?: string;
  userName?: string;
  userImage?: string;
  equipment?: EquipmentList[];

  constructor(equipment?: {
    id?: string;
    userId?: string;
    userName?: string;
    userImage?: string;
    equipment?: EquipmentList[];
  }) {
    this.equipmentId = equipment?.id;
    this.userId = equipment?.userId;
    this.userName = equipment?.userName;
    this.userImage = equipment?.userImage;
    this.equipment = equipment?.equipment;
  }

  static parse(raw: any) {
    const equipment = new Equipment(raw);
    equipment.equipment = equipment.equipment?.map((list) => EquipmentList.parse(list));
    return equipment;
  }

  toJson() {
    return {
      equipmentId: this.equipmentId || null,
      userName: this.userName || null,
      userImage: this.userImage || null,
      equipment: this.equipment || null,
    };
  }
}

export class EquipmentList {
  type?: string;
  list?: EquipmentDetail[];

  constructor(equipment: { type?: string; list?: EquipmentDetail[] }) {
    this.type = equipment?.type;
    this.list = equipment?.list;
  }

  static parse(raw: any) {
    const equipmentList = new EquipmentList(raw);
    equipmentList.list = equipmentList.list?.map((detail) => EquipmentDetail.parse(detail));
    return equipmentList;
  }
}

// type 맞추기
export class EquipmentDetail {
  brand?: string;
  model?: string;
  sex?: 'M' | 'W';
  hand?: 'R' | 'L';
  year?: string;
  length?: number;
  cover?: boolean;
  purchaseInfo?: string;
  headSpec?: string;
  loftAngle?: string;
  headVolume?: string;
  headImport?: string;
  shaftSpec?: string;
  stiffness?: string;
  flex?: string;
  weight?: string;
  torque?: string;
  shaftImport?: string;
  images?: string[];

  constructor(detail: {
    brand?: string;
    model?: string;
    sex?: 'M' | 'W';
    hand?: 'R' | 'L';
    year?: string;
    length?: number;
    cover?: boolean;
    purchaseInfo?: string;
    headSpec?: string;
    loftAngle?: string;
    headVolume?: string;
    headImport?: string;
    shaftSpec?: string;
    stiffness?: string;
    flex?: string;
    weight?: string;
    torque?: string;
    shaftImport?: string;
    images?: string[];
  }) {
    this.brand = detail.brand;
    this.model = detail.model;
    this.sex = detail.sex;
    this.hand = detail.hand;
    this.year = detail.year;
    this.length = detail.length;
    this.cover = detail.cover;
    this.purchaseInfo = detail.purchaseInfo;
    this.headSpec = detail.headSpec;
    this.loftAngle = detail.loftAngle;
    this.headVolume = detail.headVolume;
    this.headImport = detail.headImport;
    this.shaftSpec = detail.shaftSpec;
    this.stiffness = detail.stiffness;
    this.flex = detail.flex;
    this.weight = detail.weight;
    this.torque = detail.torque;
    this.shaftImport = detail.shaftImport;
    this.images = detail.images;
  }

  static parse(raw: any) {
    const detail = new EquipmentDetail(raw);
    return detail;
  }
}
