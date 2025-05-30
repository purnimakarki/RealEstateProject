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
  value: bigint; // or string if you prefer (depending on how you fetch it)
  tokenAddress: string;
  propertyImageURLs: string[];

}
