export type LocationData = {
  lat: number;
  lon: number;
  city: string;
  region: string;
};

export type CountryData = {
  code: string;
  name: string;
  count: number;
  locations: LocationData[];
}; 