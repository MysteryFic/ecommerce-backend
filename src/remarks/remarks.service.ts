import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../generated/prisma/prisma.service';
import { CreateRemarkDto } from './dto/create-remark.dto';
import { UpdateRemarkDto } from './dto/update-remark.dto';

@Injectable()
export class RemarksService {
    constructor (private prisma: PrismaService){}
    async getRemarks(){
        return this.prisma.remark.findMany({
            include:{student: true},
        })
    }

    async getAllRemarksUnscoped(){
        return this.prisma.remark.findMany({
            orderBy: {createdAt: 'desc'},
        })
    }

    private async searchStudentExists(studentId: number){
        const student = await this.prisma.student.findUnique({where: {id:studentId}});
        if(!student){
            throw new NotFoundException(`Student with id ${studentId} not found`);
        }
        return student;
    }

    async getAllRemarks(studentId: number){
        await this.searchStudentExists(studentId);
        return this.prisma.remark.findMany({
            where: {studentId},
            orderBy: {createdAt: 'desc'},
        });
    }

    async createRemark(dto: CreateRemarkDto){
        await this.searchStudentExists(dto.studentId);
        return this.prisma.remark.create({data:dto});
    }

    async updateRemark(id: number, dto:UpdateRemarkDto){
        await this.searchStudentExists(id);
        return this.prisma.remark.update({
            where: {id},
            data:dto
        })
    }

    async updateRemarkPut(id: number, dto:UpdateRemarkDto){
        await this.searchStudentExists(id);
        return this.prisma.remark.update({
            where: {id},
            data:dto
        })
    }
    async deleteRemark(id:number){
        await this.searchStudentExists(id);
        return this.prisma.remark.delete({where: {id}});
    }




}