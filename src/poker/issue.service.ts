import { Injectable } from '@nestjs/common';
import { DataRearrange } from './dto/dataRerrange.dto';
import firestore from '../firestore';
import database from '../database';
@Injectable()
export class IssueService {
  async getAllIssue(room: string): Promise<{}> {
    const data = {};
    try {
      const snap = await firestore.collection('poker').doc(room).collection('issues').get();
      snap.forEach(docs => {
        data[docs.id] = { name: docs.data().name, average_score: docs.data().score };
      });
    } catch (err) {
      console.log(err);
    }
    return data;
  }

  async getSpecificIssue(room: string, issue: string): Promise<{}> {
    const data = {};
    try {
      await firestore.collection('poker').doc(room).collection('issues').doc(issue)
        .get()
        .then(docs => {
          console.log(docs.id, docs.data());
          data[docs.id] = docs.data();
        });
    } catch (err) {
      console.log(err);
    }
    return data;
  }

  async createIssue(room: string, id: string, data: { name: string, owner: string, issueType: string; }): Promise<void> {
    const DateInSec = new Date();
    const unixtime = DateInSec.valueOf();
    const DateInFormat = new Date(unixtime);
    let docs;
    try {
      docs = await firestore.collection('poker').doc(room).collection('issues').add({
        name: data.name,
        score: '-',
        selected: Boolean(false),
        id,
        owner_name: data.owner,
        history: [{ CreateDate: [DateInFormat], average_score: '-' }],
        breakdown_time: Number(0),
        voting_time: Number(0),
        issue_type: JSON.parse(data.issueType),
      });
    } catch (err) {
      console.log(err);
    }
    const issueid = docs.id as string;
    const resultRoom = await firestore.collection('poker').doc(room).get();
    const newIssue = resultRoom.data()?.issues as Array<string>;
    newIssue.push(issueid);
    try {
      await firestore.collection('poker').doc(room).update({
        issues: newIssue,
      });
    } catch (err) {
      console.log(err);
    }
  }

  async deleteIssue(room: string, issue: string): Promise<any> {
    let res;
    try {
      res = await firestore.collection('poker').doc(room).collection('issues').doc(issue)
        .delete();
    } catch (err) {
      console.log(err);
    }
    return res;
  }

  async changeIssueName(room: string, issue: string, data: { name: string, owner: string, issueType: string; }): Promise<any> {
    let res;
    try {
      res = await firestore.collection('poker').doc(room).collection('issues').doc(issue)
        .update({
          name: data.name,
          owner_name: data.owner,
          issue_type: JSON.parse(data.issueType),
        });
    } catch (err) {
      console.log(err);
    }
    return res;
  }

  async rearrangeIssue(room: string, data: DataRearrange): Promise<void> {
    // const id_data = [];
    // Object.keys(data).forEach(key => {
    //   id_data.push(key);
    //   try {
    //     firestore.collection('poker').doc(room.room).collection('issues').doc(key)
    //       .update({
    //         id: data[key].id,
    //         score: data[key].score,
    //         name: data[key].title,
    //         selected: data[key].selected,
    //       });
    //   } catch (err) {
    //     console.log(err);
    //   }
    // });
    // try {
    //   await firestore.collection('poker').doc(room.room).update({
    //     issues: id_data,
    //   });
    // } catch (err) {
    //   console.log(err);
    // }
  }

  async updateIssue(roomId: string, issueinRoom: string): Promise<void> {
    function reviver(key: any, value: any): any {
      if (typeof value === 'object' && value !== null) {
        if (value.dataType === 'Map') {
          return new Map(value.value);
        }
      }
      return value;
    }
    // console.log(issueinRoom)
    const issueInRoom = JSON.parse(issueinRoom, reviver);
    const iterator = issueInRoom.keys();
    const id_data = [] as string[];
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < issueInRoom.size; i++) {
      const key = iterator.next().value;
      id_data.push(key);
    }

    try {
      await Promise.all(id_data.map((key) => (
        firestore.collection('poker').doc(roomId).collection('issues').doc(key)
          .update({
            id: issueInRoom.get(key)?.id,
            score: issueInRoom.get(key)?.score,
            name: issueInRoom.get(key)?.title,
            selected: issueInRoom.get(key)?.selected,
            owner_name: issueInRoom.get(key)?.ownerName,
            breakdown_time: issueInRoom.get(key)?.breakdownTime,
            voting_time: issueInRoom.get(key)?.votingTime,
            issue_type: issueInRoom.get(key)?.issueType,
          })
      )));
    } catch (err) {
      console.log(err);
    }
    try {
      await firestore.collection('poker').doc(roomId).update({
        issues: id_data,
      });
    } catch (err) {
      console.log(err);
    }
  }

  async updateScore(room: string, issue: string, score: string): Promise<void> {
    let res;
    try {
      res = await firestore.collection('poker').doc(room).collection('issues').doc(issue)
        .update({
          score: String(score),
        });
    } catch (err) {
      console.log(err);
    }
  }
}
