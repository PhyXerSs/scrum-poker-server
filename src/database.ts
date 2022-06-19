import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/database';

// const firebaseConfig = {
//     apiKey: "AIzaSyCPKorkhQpFVV0b12XwzMPUskTfcc1zm7g",
//     authDomain: "testinternbackend.firebaseapp.com",
//     databaseURL: "https://testinternbackend-default-rtdb.firebaseio.com",
//     projectId: "testinternbackend",
//     storageBucket: "testinternbackend.appspot.com",
//     messagingSenderId: "448103004110",
//     appId: "1:448103004110:web:6d2d5728760f1fa99f9d9f"
//   };

// const firebaseConfig = {
//   apiKey: "AIzaSyClLxqZDMlHsZg9ofptNj_IsSdF_lvNylc",
//   authDomain: "poker-2c494.firebaseapp.com",
//   projectId: "poker-2c494",
//   storageBucket: "poker-2c494.appspot.com",
//   messagingSenderId: "40517616525",
//   appId: "1:40517616525:web:d5775bb9f8bd336ae7f3c4"
// };

const firebaseConfig = {
  apiKey: "AIzaSyClLxqZDMlHsZg9ofptNj_IsSdF_lvNylc",
  authDomain: "poker-2c494.firebaseapp.com",
  databaseURL: "https://poker-2c494-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "poker-2c494",
  storageBucket: "poker-2c494.appspot.com",
  messagingSenderId: "40517616525",
  appId: "1:40517616525:web:d5775bb9f8bd336ae7f3c4"
};

// const firebaseConfig = {
//   apiKey: "AIzaSyDab6zX873Hce3fFOgOAccrAq5ddg_2YEU",
//   authDomain: "connect-x-sandbox-22779.firebaseapp.com",
//   databaseURL: "https://connect-x-sandbox-22779.firebaseio.com",
//   projectId: "connect-x-sandbox-22779",
//   storageBucket: "connect-x-sandbox-22779.appspot.com",
//   messagingSenderId: "1035301278821",
//   appId: "1:1035301278821:web:3463957445df1e8ca4a28c",
//   measurementId: "G-JTNG86F17Z"
// };

firebase.initializeApp(firebaseConfig)
const database = firebase.database()

export default database