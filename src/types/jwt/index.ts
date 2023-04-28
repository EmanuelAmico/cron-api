export interface InfoRolPayload {
  name: string;
  module: string;
}

export interface InfoUserPayload {
  id: number;
  email: string;
  lastName: string;
  firstName: string;
}

export interface Payload {
  user: InfoUserPayload;
  expiresIn: string;
  iat: number;
  roles?: InfoRolPayload[];
}
