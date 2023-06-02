declare namespace Express {
  export interface Request {
    role?: "bot" | "backoffice" | "landing" | "pledu";
  }
}
