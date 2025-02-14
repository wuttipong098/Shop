import { getFirestore, addDoc, collection, query, where, getDocs } from "firebase/firestore";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// ฟังก์ชันตรวจสอบว่า userId มีอยู่ใน Firestore แล้วหรือไม่
export const checkUser = async (userId: string): Promise<boolean> => {
    // เช็กใน Collection "Pending"
    const pendingRef = collection(db, "Pending");
    const qPending = query(pendingRef, where("userId", "==", userId));
    const pendingSnapshot = await getDocs(qPending);

    // เช็กใน Collection "Member"
    const memberRef = collection(db, "Member");
    const qMember = query(memberRef, where("userId", "==", userId));
    const memberSnapshot = await getDocs(qMember);

    // ถ้าเจอใน "Pending" หรือ "Member" จะคืนค่า true
    return !pendingSnapshot.empty || !memberSnapshot.empty;
};

// ฟังก์ชันบันทึกข้อมูล User พร้อม userId
export const saveUserData = async (userData: { FirstName: string; LastName: string; PhoneNumber: string; userId: string }) => {
    try {
        // ตรวจสอบก่อนว่า userId นี้มีใน Firestore หรือยัง
        const userExists = await checkUser(userData.userId);
        if (userExists) {
            console.log("User already exists in the database.");
            return; // ถ้ามี userId นี้อยู่แล้ว ก็ไม่บันทึกข้อมูลใหม่
        }
        
        // ถ้ายังไม่เคยมี userId นี้ใน Firestore, ให้ทำการบันทึกใน Collection Member
        const addUser = await addDoc(collection(db, "Pending"), {
            userId: userData.userId,
            FirstName: userData.FirstName,
            LastName: userData.LastName,
            PhoneNumber: userData.PhoneNumber
        });
        console.log("User data saved with ID:", addUser.id);

        // เพิ่ม Point = 0 ใน Collection MemberPoint
        const addPoint = await addDoc(collection(db, "MemberPoint"), {
            userId: userData.userId,
            Point: 0
        });
        console.log("User point initialized to 0 with ID:", addPoint.id);

    } catch (error) {
        console.error("Error saving user data to Firestore:", error);
    }
};
