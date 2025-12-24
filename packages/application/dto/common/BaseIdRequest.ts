import { IsUUID } from 'class-validator';

export class BaseIdRequest {
    @IsUUID()
    id: string;
}
