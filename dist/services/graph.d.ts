import { Client } from "@microsoft/microsoft-graph-client";
/** Scopes sufficient for read-only operations (no message sending, no file uploads). */
export declare const READ_ONLY_SCOPES: string[];
/** Full scopes including write operations. */
export declare const FULL_SCOPES: string[];
export interface AuthStatus {
    isAuthenticated: boolean;
    userPrincipalName?: string | undefined;
    displayName?: string | undefined;
    expiresAt?: string | undefined;
}
export declare class GraphService {
    private static instance;
    private client;
    private isInitialized;
    private tokenExpiresAt;
    private msalApp;
    private msalAccount;
    private _readOnlyMode;
    static getInstance(): GraphService;
    /** Whether the service operates in read-only mode (reduced permission scopes). */
    get readOnlyMode(): boolean;
    set readOnlyMode(value: boolean);
    /** Returns the scopes to request based on the current mode. */
    get scopes(): string[];
    private initializeClient;
    private acquireToken;
    getAuthStatus(): Promise<AuthStatus>;
    getClient(): Promise<Client>;
    isAuthenticated(): boolean;
    validateToken(token: string): string | undefined;
}
//# sourceMappingURL=graph.d.ts.map