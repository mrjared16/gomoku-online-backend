import { MailerOptions } from '@nestjs-modules/mailer/dist';
import { ExtractJwt } from 'passport-jwt';
import { createTransport } from 'nodemailer';
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
class ConfigService {
  constructor(
    private env,
    private node_env: 'development' | 'production' = 'development',
  ) {}
  private readonly configs = {
    development: {
      typeorm: {
        type: 'postgres',
        host: this.env.POSTGRES_HOST,
        port: this.env.POSTGRES_PORT || 5432,
        username: this.env.POSTGRES_USER,
        password: this.env.POSTGRES_PASSWORD,
        database: this.env.POSTGRES_DATABASE,
        entities: ['dist/**/*.entity{.ts,.js}'],
        migrations: ['src/migrations/*.ts', 'dist/migrations/*{.ts,.js}'],
        cli: {
          migrationsDir: 'src/migrations',
        },
        synchronize: true,
        logging: ['error'],
      },
      google: {
        clientID: this.env.GOOGLEOAUTH_CLIENTID,
        clientSecret: this.env.GOOGLEOAUTH_CLIENTSECRET,
        callbackURL: `http://${this.env.HOST}:${this.env.PORT}/auth/oauth/google/callback`,
      },
      jwt: {
        secret: this.env.JWT_SECRET,
        signOptions: {
          // TODO: handle expire token
          // expiresIn: '3600s'
        },
      },
      host: this.env.HOST,
      port: this.env.PORT,
      socketPort: this.env.SOCKET_PORT,
    },
    production: {
      typeorm: {
        type: 'postgres',
        host: this.env.POSTGRES_HOST,
        port: this.env.POSTGRES_PORT || 5432,
        username: this.env.POSTGRES_USER,
        password: this.env.POSTGRES_PASSWORD,
        database: this.env.POSTGRES_DATABASE,
        entities: ['dist/**/*.entity{.ts,.js}'],
        migrations: ['src/migrations/*.ts', 'dist/migrations/*{.ts,.js}'],
        cli: {
          migrationsDir: 'src/migrations',
        },
        synchronize: this.env.TYPEORM_SYNCRHONIZE == 'OFF' || true,
        migrationsRun: true,
      },
      google: {
        clientID: this.env.GOOGLEOAUTH_CLIENTID,
        clientSecret: this.env.GOOGLEOAUTH_CLIENTSECRET,
        callbackURL: `http://${this.env.HOST}:${this.env.PORT}/auth/oauth/google/callback`,
      },
      jwt: {
        secret: this.env.JWT_SECRET,
        signOptions: {
          // TODO: handle expire token
          // expiresIn: '3600s'
        },
      },
      host: this.env.HOST,
      port: this.env.PORT,
      socketPort: this.env.SOCKET_PORT,
    },
  };

  // private readonly currentConfig = this.configs['development'];
  private readonly currentConfig = this.configs[this.node_env];

  private getJWTSecret() {
    return (this.currentConfig as any).jwt.secret;
  }

  public getTypeORMConfig() {
    return (this.currentConfig as any).typeorm;
  }

  public getJWTConfig() {
    return {
      secret: this.getJWTSecret(),
      signOptions: (this.currentConfig as any).jwt.signOptions,
    };
  }

  public getPassportLocalStrategyConfig() {
    return {
      usernameField: 'username',
    };
  }

  public getPassportJWTStrategyConfig() {
    return {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: this.getJWTSecret(),
    };
  }

  public getCurrentHost(): {
    host: string;
    port: number;
    hostUrl: string;
    socketPort: number;
  } {
    return {
      host: (this.currentConfig as any).host,
      port: (this.currentConfig as any).port,
      hostUrl: `http://${(this.currentConfig as any).host}:${
        (this.currentConfig as any).port
      }`,
      socketPort: (this.currentConfig as any).socketPort,
    };
  }

  public getClientHost() {
    return this.env.CLIENT_HOST;
  }
  public getMailServiceConfig(): MailerOptions {
    const { host } = this.getCurrentHost();
    const transport = createTransport({
      host: this.env.SMTP_SERVICE_HOST,
      port: this.env.SMTP_SERVICE_PORT,
      secure: true,
      auth: {
        user: this.env.SMTP_USERNAME,
        pass: this.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    return {
      transport: transport,
      defaults: {
        from: `Gomoku online <noreply@${host}>`,
      },
    };
  }
}

const node_env: 'production' | 'development' = process.env.NODE_ENV as
  | 'production'
  | 'development';
export const Config = new ConfigService(process.env, node_env);
