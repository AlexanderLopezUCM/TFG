//  DTOs

//  Used when authentication has been completed (see login/page.tsx)
export interface AuthLoginDTO {
  token: string;
}

//  Sample
export interface SampleDTO {
  id: number,
  name: string,
  description: string,
  tags: string[],
  publicationStatus: number,
  modelPath: string,
  user: UserDTO,
  collections: ViewCollectionDTO[],
}

export interface SamplePreviewDTO {
  id: number,
  name: string,
  description?: string,
  imageUrl?: string,
}

export interface SampleMetadata {
  name: string,
  description?: string,
  tags?: string[],
  publicationStatus: number,
}

export interface CreateSampleDTO {
  name: string,
  description?: string,
  tags?: string[],
  publicationStatus: number,
  modelID: string
}

export type PatchSampleDTO = Partial<SampleDTO>;

//  Collection
export interface CollectionPreviewDTO {
  id: string,
  name: string,
  description: string,
  sampleList: Partial<SamplePreviewDTO>[],
}

export interface CreateCollectionDTO {
  name: string,
  description?: string,
  tags?: string[],
  publicationStatus: number,
  sampleIDs?: number[]
}

export interface CollectionMetadata {
  id: number,
  name: string,
  description?: string,
  tags?: string[],
  publicationStatus: number,
  sampleIDs?: number[]  
}

export interface CreateCollectionResponseDTO {
  id: number,
}

export interface ViewCollectionDTO {
  id: number,
  name: string,
  description: string,
  tags?: string[],
  publicationStatus: number,
  userID: number,
  sampleIDs: number[],
}

export interface CollectionDTO extends ViewCollectionDTO {

}

export interface PatchCollectionDTO extends ViewCollectionDTO {
  
}

//  User
export interface UserDTO {
  id: number;
  username: string;
}

export interface PublicationStatusDTO {

}