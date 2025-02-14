import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

// ตั้งค่า Firebase
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

type UserData = {
    id: string;
    FirstName: string;
    LastName: string;
    PhoneNumber: string;
    Point: number;
};

export const checkUser = async (userId: string): Promise<boolean> => {
    try {
        // เช็คใน collection แรก: Member
        const memberRef = collection(db, "Member");
        const memberQuery = query(memberRef, where("userId", "==", userId));
        const memberSnapshot = await getDocs(memberQuery);
        
        if (!memberSnapshot.empty) {
            console.log("พบผู้ใช้ใน Collection Member");
            return true;
        }

        // เช็คใน collection ที่สอง: MemberPoint
        const pointRef = collection(db, "MemberPoint");
        const pointQuery = query(pointRef, where("userId", "==", userId));
        const pointSnapshot = await getDocs(pointQuery);

        if (!pointSnapshot.empty) {
            console.log("พบผู้ใช้ใน Collection MemberPoint");
            return true;
        }

        // ถ้าไม่เจอในทั้งสอง collection
        console.log("ไม่พบผู้ใช้ในทั้งสอง Collection");
        return false;
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการตรวจสอบผู้ใช้:", error);
        return false;
    }
};


export async function getMemberById(userId: string): Promise<UserData> {
    try {
        if (!userId) throw new Error("User ID is required");

        // ค่าเริ่มต้นของ UserData
        let member: UserData = {
            id: userId,
            FirstName: "ไม่พบข้อมูล",
            LastName: "ไม่พบข้อมูล",
            PhoneNumber: "ไม่พบข้อมูล",
            Point: 0
        };

        // เช็คใน Collection Member
        const memberRef = collection(db, "Member");
        const memberQuery = query(memberRef, where("userId", "==", userId));
        const memberSnapshot = await getDocs(memberQuery);

        if (!memberSnapshot.empty) {
            console.log("พบผู้ใช้ใน Collection Member");

            // เนื่องจาก where() อาจได้หลาย Document จึงต้องใช้ forEach
            memberSnapshot.forEach(doc => {
                const data = doc.data();
                member = {
                    id: doc.id,
                    FirstName: data.FirstName ?? "ไม่พบข้อมูล",
                    LastName: data.LastName ?? "ไม่พบข้อมูล",
                    PhoneNumber: data.PhoneNumber ?? "ไม่พบข้อมูล",
                    Point: 0 // Default ไว้ก่อน รอดึงจาก MemberPoint
                };
            });
        } else {
            console.log("ไม่พบผู้ใช้ใน Collection Member");
        }

        // เช็คใน Collection MemberPoint
        const pointRef = collection(db, "MemberPoint");
        const pointQuery = query(pointRef, where("userId", "==", userId));
        const pointSnapshot = await getDocs(pointQuery);

        if (!pointSnapshot.empty) {
            console.log("พบผู้ใช้ใน Collection MemberPoint");

            // ดึง Point มาเก็บใน member.Point
            pointSnapshot.forEach(doc => {
                const data = doc.data();
                member.Point = data.Point ?? 0;
            });
        } else {
            console.log("ไม่พบผู้ใช้ใน Collection MemberPoint");
        }

        return member;
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้:", error);
        throw error;
    }
}
