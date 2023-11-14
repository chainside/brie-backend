import { ApiProperty } from '@nestjs/swagger';

export class UserInput {
    @ApiProperty()
    public readonly firstName: string;

    @ApiProperty()
    public readonly lastName: string;

    @ApiProperty()
    public readonly email: string;

    @ApiProperty()
    public readonly password: string;

    @ApiProperty()
    public readonly company?: string;
}

export class LoginUserInput {
    @ApiProperty()
    public readonly email: string;

    @ApiProperty()
    public readonly password: string;

    @ApiProperty()
    public readonly remember: boolean;
}
