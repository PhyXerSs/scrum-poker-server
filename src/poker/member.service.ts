import { Injectable } from '@nestjs/common';
import { domainToASCII } from 'url';
import { member } from './dto/member.dto';
import firestore from '../firestore';
import database from '../database';
@Injectable()
export class MemberService {
  async addMember(roomId: string, name: string): Promise<any> {
    const DateInSec = new Date();
    const unixtime = DateInSec.valueOf();
    interface member {
      'id': string;
      'name': string;
      'score': string;
      'isHost': boolean;
      'profilePicture': string;
    }
    const newMember: member = { id: '-', name, score: '-', isHost: false, profilePicture: '-' };
    try {
      const room = await firestore.collection('poker').doc(roomId).get();
      if (room.exists) {
        const user = await firestore.collection('poker').doc(roomId).collection('members').add(newMember);
        database.ref(`poker/status/${user.id}`).set('online');
        await firestore.collection('poker_user').doc(user.id).set({
          room: roomId,
        });
        await firestore.collection('poker').doc(roomId).collection('members').doc(user.id)
          .update({
            id: user.id,
          });
        const memberInRoomDocs = await firestore.collection('poker').doc(roomId).collection('members').get();
        if (memberInRoomDocs.docs.length === 1) {
          await firestore.collection('poker').doc(roomId).collection('members').doc(user.id)
            .update({
              isHost: true,
            });
        }
        return [user.id, room.id, room.data()?.roomName] as string[];
      }
      return ['Invalid pin'];
    } catch (err) {
      return ['Invalid pin'];
    }
  }

  async removeMember(roomid: string, memberid: string): Promise<string> {
    console.log(roomid, memberid);
    try {
      await firestore.collection('poker').doc(roomid).collection('members').doc(memberid)
        .get()
        .then(docs => {
          if (docs.data().isHost) {
            try {
              firestore.collection('poker').doc(roomid).collection('members').where('id', '!=', docs.id)
                .limit(1)
                .get()
                .then(snap => {
                  snap.forEach(mem => {
                    console.log(mem.data());
                    try {
                      firestore.collection('poker').doc(roomid).collection('members').doc(mem.id)
                        .update({
                          isHost: true,
                        });
                    } catch (err) {
                      console.log(err);
                    }
                  });
                });
            } catch (err) {
              console.log(err);
            }
          }
        });
    } catch (err) {
      console.log(err);
    }

    await firestore.collection('poker').doc(roomid).collection('members').doc(memberid)
      .delete();
    await firestore.collection('poker_user').doc(memberid).delete();
    return `Remove memberid ${memberid} from room ${roomid}`;
  }

  async changeName(room: string, memberid: string, name: string): Promise<string> {
    try {
      const docs = await firestore.collection('poker').doc(room).collection('members').doc(memberid)
        .update({
          name,
        });
    } catch (err) {
      console.log(err);
    }
    return `Change name of memberid ${memberid} to ${name}`;
  }

  async votingScore(room: string, memberid: string, score: string): Promise<any> {
    let res;
    try {
      res = await firestore.collection('poker').doc(room).collection('members').doc(memberid)
        .update({
          score: String(score),
        });
    } catch (err) {
      console.log(err);
    }
    return res;
  }

  nestedDelete(room: string): any {
    try {
      firestore.collection('poker').doc(room).collection('issues').get()
        .then(snap => {
          snap.forEach(docs => {
            firestore.collection('poker').doc(room).collection('issues').doc(docs.id)
              .delete();
          });
        });
    } catch (err) {
      console.log(err);
    }

    try {
      firestore.collection('poker').doc(room).collection('members').get()
        .then(snap => {
          snap.forEach(docs => {
            firestore.collection('poker').doc(room).collection('members').doc(docs.id)
              .delete();
          });
        });
    } catch (err) {
      console.log(err);
    }
    try {
      firestore.collection('poker').doc(room).delete();
    } catch (err) {
      console.log(err);
    }
  }

  async updatePicture(room: string, memberid: string, base64: string): Promise<any> {
    // console.log("->",room,memberid)
    try {
      await firestore.collection('poker').doc(room).collection('members').doc(memberid)
        .update({
          profilePicture: base64,
        });
    } catch (err) {
      console.log(err);
    }
  }
}

//--------------------------------------------------------------------------------------------------------

async function removeMember(roomid: string, memberid: string): Promise<any> {
  try {
    await firestore.collection('poker').doc(roomid).collection('members').doc(memberid)
      .get()
      .then(docs => {
        console.log(docs.exists);
        if (docs.exists && docs.data().isHost) {
          try {
            firestore.collection('poker').doc(roomid).collection('members').where('id', '!=', docs.id)
              .limit(1)
              .get()
              .then(snap => {
                snap.forEach(mem => {
                  if (mem.exists) {
                    console.log(mem.data());
                    try {
                      firestore.collection('poker').doc(roomid).collection('members').doc(mem.id)
                        .update({
                          isHost: true,
                        });
                    } catch (err) {
                      console.log(err);
                    }
                  }
                });
              });
          } catch (err) {
            console.log(err);
          }
        }
      });
  } catch (err) {
    console.log(err);
  }
  // console.log("Pass This section")
  try {
    await firestore.collection('poker_user').doc(memberid).delete();
  } catch (err) {
    console.log(err);
  }
  // console.log("Pass This second section")
  try {
    await firestore.collection('poker').doc(roomid).collection('members').doc(memberid)
      .delete();
  } catch (err) {
    console.log(err);
  }
  // console.log("End section\n")
}

database.ref('/poker/status').on('value', (snap) => {
  snap.forEach(data => {
    const memberid = data.key;
    const status = data.val();
    if (status === 'offline') {
      try { database.ref(`/poker/status/${memberid}`).remove(); } catch (err) {
        console.log(err);
      }
      try {
        firestore.collection('poker_user').doc(memberid).get()
          .then(docs => {
            if (docs.exists) {
              console.log(memberid);
              const roomid = docs.data().room;
              removeMember(roomid, memberid);
            }
          });
      } catch (err) {
        console.log(err);
      }
    }
  });
});
