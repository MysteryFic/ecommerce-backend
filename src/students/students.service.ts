import { Injectable, NotFoundException} from '@nestjs/common';
import { PrismaService } from '../generated/prisma/prisma.service';

@Injectable()
export class StudentsService {
    constructor (private prisma: PrismaService){}
    async getStudents(){
        return this.prisma.student.findMany({
            include:{program: true},
        })
    }
    
    async getStudentById(id:number){
        const student = await this.prisma.student.findUnique({
            where: {id},
            include: {
                program:true,
                remarks:{
                    orderBy: {createdAt: 'asc'},
                },
            },
        });
        if(!student){
            throw new NotFoundException(`Student with id ${id} not found`);
        }
        return student;
    }

}
