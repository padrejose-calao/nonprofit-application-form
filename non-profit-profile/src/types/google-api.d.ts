/**
 * Type declarations for Google APIs
 */

declare global {
  interface Window {
    gapi: {
      load: (api: string, callback: () => void) => void;
      client: {
        init: (config: unknown) => Promise<void>;
        drive: {
          files: {
            create: (params: unknown) => Promise<unknown>;
            list: (params: unknown) => Promise<unknown>;
            get: (params: unknown) => Promise<unknown>;
            update: (params: unknown) => Promise<unknown>;
            delete: (params: unknown) => Promise<unknown>;
          };
          about: {
            get: (params: unknown) => Promise<unknown>;
          };
        };
        getToken: () => any;
        setToken: (token: unknown) => void;
      };
      auth2: {
        getAuthInstance: () => {
          isSignedIn: {
            get: () => boolean;
          };
          currentUser: {
            get: () => {
              getBasicProfile: () => {
                getEmail: () => string;
                getName: () => string;
              };
            };
          };
          signIn: () => Promise<unknown>;
          signOut: () => Promise<void>;
        };
      };
    };
  }
}

export {};