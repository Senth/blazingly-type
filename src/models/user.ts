export interface User {
  uid: string
  exercisesJSON?: string // The current settings for the user.
}

export interface UserProfile {
  uid: string
  photoURL: string
  email: string
}
