import {IsInt, IsString, IsNotEmpty, IsOptional, isInt} from 'class-validator';

export class CreateRemarkDto{
    @IsInt()
    studentId: number;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsOptional()
    @IsString()
    category?: string;
}