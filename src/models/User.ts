export interface User {
  id: string
  email: string
  password: string
  wa_connected: boolean
}
  
  export const users: User[] = []