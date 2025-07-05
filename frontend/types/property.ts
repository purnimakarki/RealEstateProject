export interface Property {
  id: number;
  title: string;
  description: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: string;
  apartmentType: string;
  amenities: string[];
  propertyImageURLs: string[];
  yearBuilt: number;
  featured: boolean;
}

export interface PropertyResponse {
  propertyAddress: string;
  value: bigint;
  tokenAddress: string;
  propertyImageURLs: string[];
  bedrooms: number;
  bathrooms: number;
  area: number;
  city: string;
  apartmentType: string;
}
