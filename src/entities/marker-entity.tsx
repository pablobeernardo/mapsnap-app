export interface MarkerEntity {
  id: string;
  imagePath: string;
  coords: {latitude: number, longitude: number};
  description: string;
  photoDate: string;
  title: string;
  author: string;
}