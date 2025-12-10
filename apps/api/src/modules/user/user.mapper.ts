import { UserResponseDto } from "@application/dto";
import { User } from "@domain/entities";

export class UserMapper {
  static toResponseDto(user: User): UserResponseDto {
    return {
      id: user.getId(),
      email: user.getEmail().getValue(),
      firstName: user.getFirstName(),
      lastName: user.getLastName(),
      role: user.getRole(),
      isActive: user.isActive(),
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
    };
  }
}
