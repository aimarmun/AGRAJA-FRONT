export interface Config {
    "apiHost": string,
    "startMsgs": ToastMsg[]
}
export interface ToastMsg {
    "id": number,
    "beforeTitle": string,
    "title": string,
    "msg": string 
}