export interface Farmer {
    id: number,
    dni: string,
    isActive: boolean,
    name: string,
    surnames: string,
    address: string,
    telephone: string,
    email: string,
    cityId: number,
    cropTypeId: number,
    [key: string]: any
}

export interface FarmerAdd {
  dni: string,
  name: string,
  surnames: string,
  address: string,
  telephone: string,
  email: string,
  cityId: number,
  cropTypeId: number,
  [key: string]: any
}
export interface FarmerUpdate {
  dni: string | null,
  isActive: boolean | null,
  name: string | null,
  surnames: string | null,
  address: string | null,
  telephone: string | null,
  email: string | null,
  [key: string]: any
}