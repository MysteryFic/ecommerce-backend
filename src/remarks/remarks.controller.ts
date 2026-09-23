import { Controller, Get, Param, ParseIntPipe, Post, Body, Patch, Delete, Put} from '@nestjs/common';
import { RemarksService } from './remarks.service';
import { CreateRemarkDto } from './dto/create-remark.dto';
import { UpdateRemarkDto } from './dto/update-remark.dto';

@Controller('students')
export class RemarksController {
        constructor(
            private readonly remarksService: RemarksService
        ){}
        @Get()
        getRemarks(){
            return this.remarksService.getRemarks();
        }
        
        @Get('remarks')
        getAllRemarksUnscoped(){
            return this.remarksService.getAllRemarksUnscoped();
        }
        
        @Get(':id/remarks')
        getAllRemarks(@Param('id', ParseIntPipe) id:number){
            return this.remarksService.getAllRemarks(id);
        }

        @Post('remarks')
        createRemark(@Body() dto:CreateRemarkDto){
            return this.remarksService.createRemark(dto);
        }

        @Patch('remarks/:id')
        updateRemark(
            @Param('id', ParseIntPipe) id:number,
            @Body() dto: UpdateRemarkDto,
        ){
            return this.remarksService.updateRemark(id, dto);
        }

        @Put('remarks/:id')
        updateRemarkPut(
            @Param('id', ParseIntPipe) id:number,
            @Body() dto: UpdateRemarkDto,
        ){
            return this.remarksService.updateRemark(id, dto);
        }
     

        @Delete('remarks/:id')
        deleteRemark(@Param('id', ParseIntPipe) id:number){
            return this.remarksService.deleteRemark(id);
        }

}
