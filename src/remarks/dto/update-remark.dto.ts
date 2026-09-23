import {IsInt, IsString, IsNotEmpty, IsOptional, isInt} from 'class-validator';

export class UpdateRemarkDto{
    
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    content: string;

    @IsOptional()
    @IsString()
    category?: string;
}