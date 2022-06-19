import { Controller, Delete, Get, Param, Body, Post, Put } from '@nestjs/common';
import { SimpleConsoleLogger } from 'typeorm';
import { MemberService } from './member.service';

@Controller('poker')
export class MemberController {
  constructor(private readonly memberService: MemberService) { }

  @Post('member/:room/:name')
  async addMember(@Param('room') room: string, @Param('name') name: string): Promise<string[]> {
    const adding = await this.memberService.addMember(room, name);
    return adding;
  }

  @Delete('member/:room/:memberid')
  async removeMember(@Param('room') room: string, @Param('memberid') memberid: string): Promise<string> {
    const deleting = this.memberService.removeMember(room, memberid);
    return deleting;
  }

  @Put('changename/:room/:memberid/:name')
  async changeName(
    @Param('room') room: string, @Param('memberid') memberid: string, @Param('name') name: string,
  ): Promise<string> {
    const changing_name = await this.memberService.changeName(room, memberid, name);
    return changing_name;
  }

  @Put('voting/:room/:memberid')
  async votingScore(
    @Param('room') room: string, @Param('memberid') memberid: string, @Body() data: { score: string; },
  ): Promise<string> {
    const voting = await this.memberService.votingScore(room, memberid, data.score);
    return voting;
  }

  @Post('updatepicture/:room/:memberid')
  async updatePicture(
    @Param('room') room: string, @Param('memberid') memberid: string, @Body() data: { base64: string; },
  ): Promise<any> {
    // console.log("Update Picture Of member ")
    return this.memberService.updatePicture(room, memberid, data.base64);
  }
}
