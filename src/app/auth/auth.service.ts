import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { CreateUserInput } from '../user/dto/create-user.input';
import { ConfigService } from '@nestjs/config';
import { LoginUserInput } from './dto/login-user.input';
import { USER_ALREADY_EXIST_EXCEPTION } from '../common/exceptions/user.exceptions';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(loginUserInput: LoginUserInput) {
    const { email, password } = loginUserInput;
    const user = await this.userService.findOneByEmail(email);
    // encrypt the password and compare
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (user && isPasswordValid) {
      return user;
    }

    return null;
  }

  login(user: User) {
    return {
      user,
      authToken: this.jwtService.sign(
        {
          email: user.email,
          name: user.name,
          sub: user._id,
        },
        {
          secret:
            this.configService.get<string>('JWT_SECRET') || 'testingEnvSecret',
        },
      ),
    };
  }

  async signup(payload: CreateUserInput) {
    // CHECK IF THE USER ALREADY EXISTS
    const user = await this.userService.findOneByEmail(payload.email);

    if (user) {
      throw new Error(USER_ALREADY_EXIST_EXCEPTION);
    }

    // GENERATE HASH PASSWORD TO SAVE
    const hash = await bcrypt.hash(
      payload.password,
      Number(this.configService.get<string>('SALT_ROUND') || '10'),
    );

    return this.userService.createUser({ ...payload, password: hash });
  }
}
