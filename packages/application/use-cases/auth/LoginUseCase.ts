import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IUserRepository } from '@application/interfaces';
import { IJwtService, JwtPayload } from '@application/interfaces/services/IJwtService';
import { LoginDto, LoginResponseDto } from '@application/dto';

@Injectable()
export class LoginUseCase {
    constructor(
        @Inject('IUserRepository') private readonly userRepository: IUserRepository,
        @Inject('IJwtService') private readonly jwtService: IJwtService,
    ) { }

    async execute(loginDto: LoginDto): Promise<LoginResponseDto> {
        const user = await this.userRepository.findByEmail(loginDto.email);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (!user.isActive()) {
            throw new UnauthorizedException('User account is deactivated');
        }

        const isPasswordValid = await bcrypt.compare(loginDto.password, user.getPassword().getValue());

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload: JwtPayload = {
            sub: user.getId(),
            email: user.getEmail().getValue(),
            role: user.getRole(),
            firstName: user.getFirstName(),
            lastName: user.getLastName(),
        };

        const { accessToken, refreshToken, expiresIn } = this.jwtService.generateTokens(payload);

        return {
            accessToken,
            refreshToken,
            expiresIn,
            user: {
                id: user.getId(),
                email: user.getEmail().getValue(),
                firstName: user.getFirstName(),
                lastName: user.getLastName(),
                role: user.getRole(),
            },
        };
    }
}
