import { Controller, Delete, Get, Param, Body, Post, Put } from '@nestjs/common';
import { getegid } from 'process';
import { ApiUseTags } from '@nestjs/swagger';
import { brotliDecompress } from 'zlib';
import { PokerService } from './poker.service';
import { DataRearrange } from './dto/dataRerrange.dto';
import { VoteData } from './dto/voteData.dto';
import { MessageChat } from './dto/messageChat.dto';

const imageToBase64 = require('image-to-base64');

@ApiUseTags('poker')
@Controller('poker')
export class PokerController {
  constructor(private readonly appService: PokerService) { }
  @Get('/')
  getHello(): string {
    return 'ssss';
  }

  @Post('keepchat/:room')
  async keepChat(@Param('room') room: string, @Body() data: MessageChat): Promise<void> {
    // console.log(data)
    return await this.appService.keepchat(room, data);
  }

  @Post('base64')
  async base64(@Body() data: { url: string; }): Promise<string> {
    // console.log("Come in")
    const base64 = await imageToBase64(data.url); // Image URL
    return `data:image/jpeg;base64,${base64}`;
  }

  @Post('createroom/:roomname/:username')
  async createRoom(@Param('roomname') roomname: string, @Param('username') username: string
    , @Body() data: { maxFrontEndPoint: string, maxBackEndPoint: string, maxOtherPoint: string; }): Promise<string[]> {
    const roomname_ret = await this.appService.createRoom(roomname, username, data);
    return roomname_ret;
  }

  @Delete(':room')
  removeRoom(@Param('room') room: string): string {
    const deleting = this.appService.nestedDelete(room);
    return 'ok';
  }

  @Post('average/:room/:issue')
  async getAverageScore(@Param('room') room: string, @Param('issue') issue: string, @Body() voteData: VoteData): Promise<any> {
    const average = await this.appService.getAverageScore(room, issue, voteData);
    return average[0];
  }

  @Put('newvoting/:room')
  async startNewVoting(@Param('room') room: string): Promise<void> {
    const starting = await this.appService.startNewVoting(room);
    return starting;
  }

  @Post('setstatus/:room/:issue/:status')
  async setStatus(
    @Param('room') room: string, @Param('issue') issue: string, @Param('status') status: number,
  ): Promise<void> {
    // console.log(status)
    const setting = await this.appService.setStatus(room, issue, status);
    return setting;
  }

  @Post('startbreakdown/:room')
  startBreakdown(@Param('room') room: string): any {
    const message = this.appService.startBreakdown(room);
    return message;
  }

  @Post('stopbreakdown/:room')
  async stopBreakdown(@Param('room') room: string): Promise<any> {
    const message = await this.appService.stopBreakdown(room);
    return message;
  }

  @Post('startVoting/:room')
  startVoting(@Param('room') room: string): any {
    const message = this.appService.startVoting(room);
    return message;
  }

  @Post('stopVoting/:room')
  async stopVoting(@Param('room') room: string): Promise<any> {
    const message = this.appService.stopVoting(room);
    return message;
  }

  @Post('updatebreakdowntime/:room/:issue/:newtime')
  async updateBreakdownTime(
    @Param('room') room: string, @Param('issue') issue: string, @Param('newtime') newtime: number,
  ): Promise<any> {
    return await this.appService.updateBreakdownTime(room, issue, newtime);
  }

  @Post('updatevotingtime/:room/:issue/:newtime')
  async updateVotingTime(
    @Param('room') room: string, @Param('issue') issue: string, @Param('newtime') newtime: number,
  ): Promise<any> {
    return await this.appService.updateVotingTime(room, issue, newtime);
  }

  @Post('updateaveragevote/:room/:score')
  async updateAverageVote(@Param('room') room: string, @Param('score') score: string): Promise<any> {
    return await this.appService.updateAverageVote(room, score);
  }

  @Post('updatevotingsystem/:room/:sequence')
  async updateVotingSystem(@Param('room') room: string, @Param('sequence') sequence: string): Promise<any> {
    return await this.appService.updateVotingSystem(room, sequence);
  }

  @Post('updatebdandvtime/:room/:issue/:newbd/:newv')
  async updateBreakdownAndVotingTime(
    @Param('room') room: string, @Param('issue') issue: string, @Param('newbd') newbd: number, @Param('newv') newv: number,
  ): Promise<any> {
    return await this.appService.updateBreakdownTimeAndVotingTime(room, issue, newbd, newv);
  }

  @Post('updateFEP/:room/:point')
  async updateFrontEndPoint(@Param('room') room: string, @Param('point') point: string): Promise<any> {
    return await this.appService.updateFEP(room, point);
  }

  @Post('updateBEP/:room/:point')
  async updateBackEndPoint(@Param('room') room: string, @Param('point') point: string): Promise<any> {
    return await this.appService.updateBEP(room, point);
  }

  @Post('updateOP/:room/:point')
  async updateOtherPoint(@Param('room') room: string, @Param('point') point: string): Promise<any> {
    return await this.appService.updateOP(room, point);
  }
}
