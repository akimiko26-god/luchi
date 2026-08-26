import { IsBoolean, IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
} from '../../domain/constants/iam.constants';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'SecureP@ss123!' })
  @IsString()
  @MinLength(PASSWORD_MIN_LENGTH)
  @MaxLength(PASSWORD_MAX_LENGTH)
  password!: string;

  @ApiProperty({ example: 'good_soul' })
  @IsString()
  @MinLength(USERNAME_MIN_LENGTH)
  @MaxLength(USERNAME_MAX_LENGTH)
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'Username may only contain letters, numbers and underscore' })
  username!: string;

  @ApiProperty({ example: 'Анна Иванова' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  displayName!: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  acceptTerms!: boolean;
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  password!: string;
}

export class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;
}

export class AuthUserDto {
  id!: string;
  email!: string;
  username!: string;
  displayName!: string;
  emailVerified!: boolean;
  roles!: string[];
}

export class AuthResponseDto {
  user!: AuthUserDto;
  accessToken!: string;
  expiresIn!: number;
}

export type AuthSessionResult = AuthResponseDto & {
  refreshToken: string;
};

export class UserProfileDto extends AuthUserDto {
  bio?: string | null;
  city?: string | null;
  country!: string;
  level!: number;
  experiencePoints!: number;
  createdAt!: string;
}
