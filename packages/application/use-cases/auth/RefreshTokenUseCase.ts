import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { IJwtService } from '@application/interfaces/services/IJwtService';
import { IUserRepository } from '@application/interfaces';
import { RefreshTokenDto, RefreshTokenResponseDto } from '@application/dto';
import { JwtPayload } from '@application/interfaces/services/IJwtService';

@Injectable()
export class RefreshTokenUseCase {
    constructor(
        @Inject('IUserRepository') private readonly userRepository: IUserRepository,
        @Inject('IJwtService') private readonly jwtService: IJwtService,
    ) { }

    async execute(refreshTokenDto: RefreshTokenDto): Promise<RefreshTokenResponseDto> {
        const { sub } = this.jwtService.verifyRefreshToken(refreshTokenDto.refreshToken);

        const user = await this.userRepository.findById(sub);

        if (!user || !user.isActive()) {
            throw new UnauthorizedException('Invalid refresh token');
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
        };
    }
}
