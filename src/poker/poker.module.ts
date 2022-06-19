import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PokerController } from './poker.controller';
import { PokerService } from './poker.service';
import { IssueController } from './issue.controller';
import { IssueService } from './issue.service';
import { MemberController } from './member.controller';
import { MemberService } from './member.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
  ],
  controllers: [PokerController, IssueController, MemberController],
  providers: [PokerService, IssueService, MemberService],
  exports: [PokerService, IssueService, MemberService],

})
export class PokerModule {}
