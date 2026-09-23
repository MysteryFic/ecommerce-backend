import { Controller, Get, ParseIntPipe, Param } from '@nestjs/common';
import { StudentsService } from './students.service';
@Controller('students')

export class StudentsController {
    constructor(
        private readonly studentsService: StudentsService
    ){}

    @Get()
    getStudent(){
        return this.studentsService.getStudents();
    }
    @Get(':id')
    ggetStudentById(@Param('id', ParseIntPipe) id:number){
        return this.studentsService.getStudentById(id);
    }



}
