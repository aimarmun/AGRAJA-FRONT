export interface UserLogin {
    name: string,
    password: string
}

export interface User {
    name: string,
    rol: string,
    exp: number
}

export interface UserNewPassword extends UserLogin{
    newPassword: string
}
