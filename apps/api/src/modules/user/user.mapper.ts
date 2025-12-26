import { UserResponseDto } from "@application/dto";
import { User } from "@domain/entities";

export class UserMapper {
  static toResponseDto(user: User | any): UserResponseDto {
    return {
      id: user instanceof User ? user.getId() : user.id,
      email: user instanceof User ? user.getEmail().getValue() : user.email,
      firstName: user instanceof User ? user.getFirstName() : user.firstName,
      lastName: user instanceof User ? user.getLastName() : user.lastName,
      role: user instanceof User ? user.getRole() : user.role,
      isActive: user instanceof User ? user.isActive() : user.isActive,
      createdAt: user instanceof User ? user.getCreatedAt() : user.createdAt,
      updatedAt: user instanceof User ? user.getUpdatedAt() : user.updatedAt,
    };
  }
}
