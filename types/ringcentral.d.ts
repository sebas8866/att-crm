// Type declaration for ringcentral SDK
declare module 'ringcentral' {
  export class SDK {
    constructor(config: {
      server: string;
      clientId: string;
      clientSecret: string;
    });
    platform(): Platform;
  }

  export class Platform {
    login(credentials: { jwt?: string; access_token?: string }): Promise<void>;
    get(url: string): Promise<Response>;
    post(url: string, body?: any): Promise<Response>;
    auth(): Auth;
  }

  export class Auth {
    setData(data: { access_token?: string; refresh_token?: string }): void;
  }

  export interface Response {
    json(): Promise<any>;
  }
}
