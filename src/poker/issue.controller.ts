import { Controller, Delete, Get, Param, Body, Post, Put } from '@nestjs/common';
import { DataRearrange } from './dto/dataRerrange.dto';
import { IssueService } from './issue.service';

@Controller('poker')
export class IssueController {
  constructor(private readonly issueService: IssueService) { }

  @Get('issue/:room')
  async getAllIssue(@Param('room') room: string): Promise<any> {
    const getting = await this.issueService.getAllIssue(room);
    return getting;
  }

  @Get('issue/:room/:issue')
  async getSpecificIssue(@Param('room') room: string, @Param('issue') issue: string): Promise<any> {
    const getting = await this.issueService.getSpecificIssue(room, issue);
    return getting;
  }

  @Post('issue/:room/:id')
  async createIssue(
    @Param('room') room: string, @Param('id') id: string, @Body() data: { name: string, owner: string, issueType: string; },
  ): Promise<any> {
    const adding = await this.issueService.createIssue(room, id, data);
    return adding;
  }

  @Delete('issue/:room/:issue')
  async deleteIssue(@Param('room') room: string, @Param('issue') issue: string): Promise<any> {
    const deleting = await this.issueService.deleteIssue(room, issue);
    return deleting;
  }

  @Put('issue/:room/:issue')
  async changeIssueName(
    @Param('room') room: string, @Param('issue') issue: string, @Body() data: { name: string, owner: string, issueType: string; },
  ): Promise<any> {
    const changing = await this.issueService.changeIssueName(room, issue, data);
    return changing;
  }

  @Put('issue/:room')
  async rearrangeIssue(@Param() room: string, @Body() dataRearrange: DataRearrange): Promise<any> {
    console.log(dataRearrange);
    const rearranging = await this.issueService.rearrangeIssue(room, dataRearrange);
    return rearranging;
  }

  @Post('updateissue/:room')
  async updateissue(@Param('room') room: string, @Body() issueInRoom: any): Promise<any> {
    const updating = await this.issueService.updateIssue(room, issueInRoom.data);
    return updating;
  }

  @Post('updatescore/:room/:issue/:score')
  async updateScore(@Param('room') room: string, @Param('issue') issue: string, @Param('score') score: string): Promise<any> {
    const updating = await this.issueService.updateScore(room, issue, score);
    return updating;
  }
}
