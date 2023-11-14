export interface Config {
    readonly API_PORT: number;

    readonly API_PREFIX: string;

    readonly SWAGGER_ENABLE: number;

    readonly TYPEORM_CONNECTION: string;

    readonly TYPEORM_HOST: string;

    readonly TYPEORM_PORT: number;

    readonly TYPEORM_USERNAME: string;

    readonly TYPEORM_PASSWORD: string;

    readonly TYPEORM_DATABASE: string;


    readonly TYPEORM_MIGRATIONS: string;

    readonly SWAGGER_TITLE: string;

    readonly SWAGGER_DESCRIPTION: string;

    readonly SWAGGER_PREFIX: string;

    readonly JWT_PRIVATE_KEY: string;

    readonly JWT_PUBLIC_KEY: string;

    readonly NODE_ENV: string;

    readonly SCHEDULER_INTERVAL_MS_CUSTOM_APPROVE_CLEARANCE: number;

    readonly SCHEDULER_INTERVAL_MS_CUSTOM_APPROVE_DDT: number;

    readonly SCHEDULER_INTERVAL_MS_CUSTOM_APPROVE_CLOSING: number;

    readonly SCHEDULER_INTERVAL_MS_DB_CLEANER: number;

    readonly CAKE_URI: string;
}
