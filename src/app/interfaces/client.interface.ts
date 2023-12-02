export interface Client {
    id: number,
    dni: string,
    isActive: boolean,
    name: string,
    surnames: string,
    address: string,
    telephone: string,
    email: string
    [key: string]: any
}

export interface ClientFarmerHirings extends Client{
    farmerId: number,
    hiringId: number,
    hiringDateTime: Date
}
