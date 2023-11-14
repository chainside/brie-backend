import { ApiProperty } from '@nestjs/swagger';
import { Company, CompanyData } from '../../company/model';

export class UserData {
    @ApiProperty({
        description: 'User unique ID',
        example: '80efb8f2-fcb8-4e6d-bf6e-01c67cf0c9e0',
    })
    public readonly id: string;

    @ApiProperty({ description: 'First name', example: 'John' })
    public readonly firstName: string;

    @ApiProperty({ description: 'Last name', example: 'Doe' })
    public readonly lastName: string;

    @ApiProperty({ description: 'Email', example: 'john.doe@excentio.com' })
    public readonly email: string;

    @ApiProperty({ description: 'Company', type: CompanyData })
    public readonly company?: Company;
}
