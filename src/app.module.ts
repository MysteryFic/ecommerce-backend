import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StudentsModule } from './students/students.module';
import {PrismaModule} from './generated/prisma/prisma.module'
import { RemarksModule } from './remarks/remarks.module';

@Module({
  imports: [ RemarksModule, StudentsModule, PrismaModule,],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

