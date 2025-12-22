import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Role } from "prisma/generated/prisma/enums";

export class LoginDto {
  @ApiProperty({ example: "admin@dietapp.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "Password123!" })
  @IsString()
  @MinLength(1)
  password: string;
}

export class LoginResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  expiresIn: number;

  @ApiProperty()
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}

export class RefreshTokenResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  expiresIn: number;
}

export class RegisterDto {
  @ApiProperty({ example: "newuser@dietapp.com" }) @IsEmail() email: string;
  @ApiProperty({ example: "Password123!" })
  @IsString()
  @MinLength(6)
  password: string;
  @ApiProperty({ example: "Furkan" }) @IsString() firstName: string;
  @ApiProperty({ example: "Türkyılmaz" }) @IsString() lastName: string;
  @ApiProperty({
    example: "CLIENT",
    enum: ["ADMIN", "DIETITIAN", "CLIENT"],
    required: false,
  })
  @IsOptional() 
  @IsEnum(Role, { message: 'role must be ADMIN, DIETITIAN or CLIENT' }) role?: Role;
}
export class RegisterResponseDto {
  @ApiProperty() accessToken: string;
  @ApiProperty() refreshToken: string;
  @ApiProperty() expiresIn: number;
  @ApiProperty() user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}
