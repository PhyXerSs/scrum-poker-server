import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { nanoid } from 'nanoid';
import { VoteData } from './dto/voteData.dto';
import { MessageChat } from './dto/messageChat.dto';
import firestore from '../firestore';
import database from '../database';
@Injectable()
export class PokerService {
  @Cron('0 0 * * * *')
  handleCron(): void {
    console.log('Run Check Active Room');
    this.checkActiveRoom(86400);
  }

  async keepchat(room: string, data: MessageChat): Promise<void> {
    // console.log(data)
    const timeinsec = String(new Date().valueOf());
    try {
      await firestore
        .collection('poker')
        .doc(room)
        .collection('chat')
        .doc(timeinsec)
        .set({
          message: data.message,
          memberId: data.memberId,
          name: data.name,
          profilePicture: data.profilePicture,
          timestamp: Number(timeinsec),
          imageUrl: data.imageUrl,
        });
    } catch (err) {
      console.log(err);
    }
  }

  checkActiveRoom(seconds: Number): void {
    try {
      firestore.collection('poker').get()
        .then(snap => {
          snap.forEach(room => {
            const diffTimeInSec = (new Date().valueOf() / 1000) - (room.data().ActiveDate.seconds);
            if (diffTimeInSec >= seconds) {
              this.nestedDelete(room.id);
            }
          });
        });
    } catch (err) {
      console.log(err);
    }
  }

  deleteRoom(room: string): void {
    try {
      firestore.collection('poker').doc(room).delete();
    } catch (err) {
      console.log(err);
    }
  }

  async createRoom(roomName: string, username: string, data: {
    maxFrontEndPoint: string, maxBackEndPoint: string, maxOtherPoint: string;
  }): Promise<string[]> {
    const roomid = nanoid(6);
    let creatorid: any;
    const DateInSec = new Date();
    const unixtime = DateInSec.valueOf();
    const DateInFormat = new Date(unixtime);
    const retdata = [roomid] as string[];
    const creator = {
      id: '-',
      name: username,
      score: '-',
      isHost: true,
      profilePicture: '-',
    };
    const issue = {
      name: 'Untitled',
      owner_name: '',
      score: '-',
      history: [{ CreateDate: [DateInFormat], average_score: '-' }],
      id: '0',
      selected: Boolean(false),
      breakdown_time: Number(0),
      voting_time: Number(0),
      issue_type: ['Other'],
    };

    try {
      await firestore.collection('poker').doc(roomid).set({
        ActiveDate: DateInFormat,
        status: Number(1),
        roomName,
        votingSystem: 'fibo',
        isClearingScore: false,
        maxFrontEndPoint: String(data.maxFrontEndPoint),
        maxBackEndPoint: String(data.maxBackEndPoint),
        maxOtherPoint: String(data.maxOtherPoint),
      })
        .then(async docs => {
          creatorid = await firestore.collection('poker').doc(roomid).collection('members').add(creator);
          await database.ref(`poker/status/${creatorid.id}`).set('online');
          await firestore.collection('poker_user').doc(creatorid.id).set({
            room: roomid,
          });
          retdata.push(creatorid.id);
          await firestore.collection('poker').doc(roomid).collection('members').get()
            .then(docs => {
              firestore.collection('poker').doc(roomid).collection('members').doc(creatorid.id)
                .update({
                  id: creatorid.id,
                });
            });
          firestore.collection('poker').doc(roomid).collection('issues').add(issue)
            .then(docs => {
              firestore.collection('poker').doc(roomid).update({ issues: [docs.id] });
            });
        });
    } catch (err) {
      console.log(err);
    }
    return retdata;
  }

  async getAverageScore(room: string, issue: string, voteData: VoteData): Promise<any> {
    const data = await firestore.collection('poker').doc(room).collection('issues').doc(issue)
      .get();
    try {
      await firestore.collection('poker').doc(room).collection('issues').doc(issue)
        .update({
          score: voteData.average_score,
          history: data.data().history.push(voteData.members),
        });
    } catch (err) {
      console.log(err);
    }
  }

  async startNewVoting(room): Promise<void> {
    try {
      await firestore.collection('poker').doc(room).update({
        isClearingScore: true,
      });
    } catch (err) {
      console.log(err);
    }

    const allMemberInRoom = await firestore.collection('poker').doc(room).collection('members').get();
    try {
      await Promise.all(allMemberInRoom.docs.map((doc) => (
        firestore.collection('poker').doc(room).collection('members').doc(doc.id)
          .update({
            score: '-',
          })
      )));
    } catch (err) {
      console.log(err);
    }
    try {
      await firestore.collection('poker').doc(room).update({
        isClearingScore: false,
      });
    } catch (err) {
      console.log(err);
    }
  }

  /*  async setStatus(room, issue , status) {
      await firestore.collection("poker").doc(room).collection('members').get()
        .then(snap => {
          snap.forEach(docs => {
            firestore.collection("poker").doc(room).update({
              'status': Number(status)
            })
          })
        })
        .then(async snaps => {
          if (status == 3) {
            let sum: number = 0
            let count: number = 0
            let stat = {}
            await firestore.collection("poker").doc(room).collection("members").get()
              .then(snaps => {
                snaps.forEach(docs => {
                  //console.log(docs.data())
                  if (docs.data().score !== '-') {
                    //console.log("-> " , docs.data())
                    if (docs.data().score in stat && docs.data().score >= 0) {
                      stat[docs.data().score].push(docs.data().name);
                    }
                    else {
                      stat[docs.data().score] = [docs.data().name];
                    }
                    sum += Number(docs.data().score);
                    count++;
                  }
                })
              })

            const ret_data = { 'members': stat, 'average_score': sum / count }
            firestore.collection("poker").doc(room).collection("issues").doc(issue).get()
            .then(docs => {
              let history = docs.data().history as Array<{}>
              console.log(history)
              history.push(ret_data)
              firestore.collection("poker").doc(room).collection("issues").doc(issue).update({
                "score" : ret_data['average_score'],
                "history" : history
              })
              console.log(docs.data())
            })
            console.log(ret_data)
          }
        })
    } */

  async setStatus(room: string, issueSelected: string, state: number): Promise<void> {
    let res;
    try {
      res = await firestore.collection('poker').doc(room).update({
        status: Number(state),
      });
    } catch (err) {
      console.log(err);
    }
    return res;
  }

  startBreakdown(room: string): string {
    console.log('Start Breakdown');
    const DateInSec = new Date();
    const unixtime = DateInSec.valueOf();
    const DateInFormat = new Date(unixtime);
    try {
      firestore.collection('poker').doc(room).update({
        startBreakdown: DateInFormat,
      });
    } catch (err) {
      console.log(err);
    }

    return 'Start Breakdown';
  }

  startVoting(room: string): string {
    console.log('Start Voting');
    const DateInSec = new Date();
    const unixtime = DateInSec.valueOf();
    const DateInFormat = new Date(unixtime);
    try {
      firestore.collection('poker').doc(room).update({
        startVoting: DateInFormat,
      });
    } catch (err) {
      console.log(err);
    }

    return 'Start Voting';
  }

  async stopBreakdown(room: string): Promise<string> {
    console.log('Stop Breakdown');
    const startBD = (await firestore.collection('poker').doc(room).get()).data().startBreakdown.seconds;
    const stopBD = new Date().valueOf() / 1000;
    const seconds = stopBD - startBD;
    try {
      firestore.collection('poker').doc(room).update({
        breakdownTime: seconds,
      });
    } catch (err) {
      console.log(err);
    }
    return 'Stop Breakdown';
  }

  async stopVoting(room: string): Promise<string> {
    console.log('Stop Voting');
    const startBD = (await firestore.collection('poker').doc(room).get()).data().startVoting.seconds;
    const stopBD = new Date().valueOf() / 1000;
    const seconds = stopBD - startBD;
    const result = new Date(seconds * 1000).toISOString().slice(11, 19);
    try {
      firestore.collection('poker').doc(room).update({
        votingTime: seconds,
      });
    } catch (err) {
      console.log(err);
    }
    return 'Stop Voting';
  }

  async nestedDelete(room: string): Promise<void> {
    try {
      await firestore.collection('poker').doc(room).collection('issues').get()
        .then(snap => {
          snap.forEach(docs => {
            try {
              firestore.collection('poker').doc(room).collection('issues').doc(docs.id)
                .delete();
            } catch (err) {
              console.log(err);
            }
          });
        });
    } catch (err) {
      console.log(err);
    }

    try {
      await firestore.collection('poker').doc(room).collection('members').get()
        .then(snap => {
          snap.forEach(docs => {
            try {
              firestore.collection('poker').doc(room).collection('members').doc(docs.id)
                .delete();
            } catch (err) {
              console.log(err);
            } try { firestore.collection('user').doc(docs.id).delete(); } catch (err) {
              console.log(err);
            }
          });
        });
    } catch (err) {
      console.log(err);
    }

    try {
      await firestore.collection('poker').doc(room).collection('chat').get()
        .then(snap => {
          snap.forEach(docs => {
            try {
              firestore.collection('poker').doc(room).collection('chat').doc(docs.id)
                .delete();
            } catch (err) {
              console.log(err);
            }
          });
        });
    } catch (err) {
      console.log(err);
    }

    try { await firestore.collection('poker').doc(room).delete(); } catch (err) {
      console.log(err);
    }
    try { await database.ref(`/poker/countdown/${room}`).remove(); } catch (err) {
      console.log(err);
    } try {
      await database.ref(`/poker/issue_counter/${room}`).remove();
    } catch (err) {
      console.log(err);
    } try {
      await database.ref(`/poker/alert_user_event/${room}`).remove();
    } catch (err) {
      console.log(err);
    }
  }

  async updateBreakdownTime(room: string, issue: string, newtime: number): Promise<string> {
    const issueDoc = await firestore.collection('poker').doc(room).collection('issues').doc(issue)
      .get();
    if (issueDoc.exists) {
      try {
        await firestore.collection('poker').doc(room).collection('issues').doc(issue)
          .update({
            breakdown_time: Number(newtime),
          });
      } catch (err) {
        console.log(err);
      }
    }
    return 'success update BD Time';
  }

  async updateVotingTime(room: string, issue: string, newtime: number): Promise<string> {
    const issueDoc = await firestore.collection('poker').doc(room).collection('issues').doc(issue)
      .get();
    if (issueDoc.exists) {
      try {
        await firestore.collection('poker').doc(room).collection('issues').doc(issue)
          .update({
            voting_time: Number(newtime),
          });
      } catch (err) {
        console.log(err);
      }
    }
    return 'success update V Time';
  }

  async updateAverageVote(room: string, averageVote: string): Promise<any> {
    const DateInSec = new Date();
    const unixtime = DateInSec.valueOf();
    const DateInFormat = new Date(unixtime);
    let res;
    try {
      res = await firestore.collection('poker').doc(room).update({
        ActiveDate: DateInFormat,
        averageScore: averageVote,
      });
    } catch (err) {
      console.log(err);
    }
    return res;
  }

  async updateVotingSystem(roomId: string, sequenceType: string): Promise<void> {
    try {
      await Promise.all([this.startNewVoting(roomId), firestore.collection('poker').doc(roomId).update({
        votingSystem: sequenceType,
      })]);
    } catch (err) {
      console.log(err);
    }
  }

  async updateBreakdownTimeAndVotingTime(
    roomId: string, idFromDB: string, newBreakdownTime: number, newVotingTime: number,
  ): Promise<void> {
    const issueDoc = await firestore.collection('poker').doc(roomId).collection('issues').doc(idFromDB)
      .get();
    if (issueDoc.exists) {
      try {
        await firestore.collection('poker').doc(roomId).collection('issues').doc(idFromDB)
          .update({
            breakdown_time: Number(newBreakdownTime),
            voting_time: Number(newVotingTime),
          });
      } catch (err) {
        console.log(err);
      }
    }
  }

  async updateFEP(room: string, point: string): Promise<void> {
    try {
      await firestore.collection('poker').doc(room).update({
        maxFrontEndPoint: point,
      });
    } catch (err) {
      console.log(err);
    }
  }

  async updateBEP(room: string, point: string): Promise<void> {
    try {
      await firestore.collection('poker').doc(room).update({
        maxBackEndPoint: point,
      });
    } catch (err) {
      console.log(err);
    }
  }

  async updateOP(room: string, point: string): Promise<void> {
    try {
      await firestore.collection('poker').doc(room).update({
        maxOtherPoint: point,
      });
    } catch (err) {
      console.log(err);
    }
  }
}
