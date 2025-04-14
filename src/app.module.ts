import { Module } from '@nestjs/common';
import { TestModule } from './test/test.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import dataSourceOptions from './database/typeorm';
import { SessionModule } from './session/session.module';
import { UserModule } from './user/user.module';
import { DoctorModule } from './doctor/doctor.module';
import { PatientModule } from './patient/patient.module';
import { CampaignModule } from './campaign/campaign.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    TestModule,
    SessionModule,
    UserModule,
    DoctorModule,
    PatientModule,
    CampaignModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
