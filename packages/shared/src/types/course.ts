export interface Course {
  id: string;
  creatorId: string;
  name: string;
  description?: string;
  distanceM: number;
  estDurationS?: number;
  elevationGainM?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  city?: string;
  routeGeojson: any; // GeoJSON object
  thumbnailUrl?: string;
  likeCount: number;
  saveCount: number;
  runCount: number;
  visibility: 'public' | 'draft';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCourseDto {
  name: string;
  description?: string;
  routeGeojson: any;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  thumbnailUrl?: string;
}
