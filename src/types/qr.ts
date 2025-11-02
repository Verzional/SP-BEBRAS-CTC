interface IPoint {
  x: number;
  y: number;
}

interface IBoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface IDetectedBarcode {
  boundingBox: IBoundingBox;
  cornerPoints: IPoint[];
  format: string;
  rawValue: string;
}
