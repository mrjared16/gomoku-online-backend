import { ExtractJwt } from 'passport-jwt';
require('dotenv').config();

class ConfigService {
  constructor(private env, private node_env: 'development' | 'production' = 'development') {
    node_env = 'development';
  }
  private readonly configs = {
    'development': {
      'typeorm': {
        'type': 'postgres',
        'host': this.env.POSTGRES_HOST,
        'port': this.env.POSTGRES_PORT || 5432,
        'username': this.env.POSTGRES_USER,
        'password': this.env.POSTGRES_PASSWORD,
        'database': this.env.POSTGRES_DATABASE,
        'entities': ['dist/**/*.entity{.ts,.js}'],
        'migrations': [
          'src/migrations/*.ts',
          'dist/migrations/*{.ts,.js}'
        ],
        'cli': {
          'migrationsDir': 'src/migrations'
        },
        'synchronize': true
      },
      'google': {
        'clientID': this.env.GOOGLEOAUTH_CLIENTID,
        'clientSecret': this.env.GOOGLEOAUTH_CLIENTSECRET,
        'callbackURL': `http://${this.env.HOST}:${this.env.PORT}/auth/oauth/google/callback`
      },
      'jwt': {
        'secret': this.env.JWT_SECRET,
        'signOptions': {
          // TODO: handle expire token
          // expiresIn: '3600s'
        }
      },
      'host': this.env.HOST,
      'port': this.env.PORT
    },
    'production': {
      'typeorm': {
        'type': 'postgres',
        'host': this.env.POSTGRES_HOST,
        'port': this.env.POSTGRES_PORT || 5432,
        'username': this.env.POSTGRES_USER,
        'password': this.env.POSTGRES_PASSWORD,
        'database': this.env.POSTGRES_DATABASE,
        'entities': ['dist/**/*.entity{.ts,.js}'],
        'migrations': [
          'src/migrations/*.ts',
          'dist/migrations/*{.ts,.js}'
        ],
        'cli': {
          'migrationsDir': 'src/migrations'
        },
        'synchronize': false
      },
      'google': {
        'clientID': this.env.GOOGLEOAUTH_CLIENTID,
        'clientSecret': this.env.GOOGLEOAUTH_CLIENTSECRET,
      },
      'jwt': {
        'secret': this.env.JWT_SECRET,
        'signOptions': {
          // TODO: handle expire token
          // expiresIn: '3600s'
        }
      },
      'host': this.env.HOST,
      'port': this.env.PORT
    }
  }

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
    }
  }

  public getPassportLocalStrategyConfig() {
    return {
      usernameField: 'email'
    };
  }

  public getPassportJWTStrategyConfig() {
    return {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: this.getJWTSecret(),
    }
  }

  public getCurrentHost(): { host: string, port: string, hostUrl: string } {
    return {
      host: (this.currentConfig as any).host,
      port: (this.currentConfig as any).port,
      hostUrl: `http://${(this.currentConfig as any).host}:${(this.currentConfig as any).port}`
    }
  }
}

const node_env: 'production' | 'development' = process.env.NODE_ENV as 'production' | 'development';
export const Config = new ConfigService(process.env, node_env);