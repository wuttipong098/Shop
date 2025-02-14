"use client";

import { useEffect, useState } from "react";
import Style from "@/Style/Account.module.css";
import Image from "next/image";
import logo from "@/public/logo.png";
import { getMemberById, checkUser } from "@/service/Account";
import liff from "@line/liff";
import { useRouter } from "next/navigation";

type UserData = {
    id: string;
    FirstName: string;
    LastName: string;
    PhoneNumber: string;
    Point: number;
};

export default function Account() {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const router = useRouter();

    // Loading state แรกเริ่มเพื่อป้องกัน Hydration Error
    const [isLiffReady, setIsLiffReady] = useState(false);

    useEffect(() => {
        const initLiff = async () => {
            try {
                await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID_2! });
                const profile = await liff.getProfile();
                const fetchedUserId = profile.userId;
                setUserId(fetchedUserId);

                console.log("User ID from LINE:", fetchedUserId);
                setIsLiffReady(true); // ตั้งค่าเมื่อ LIFF พร้อมใช้งาน
            } catch (err) {
                console.error("LIFF init error:", err);
                setError("ไม่สามารถดึงข้อมูลจาก LINE ได้");
                setIsLiffReady(true); // แม้จะ Error ก็ให้แสดง UI
            }
        };

        initLiff();
    }, []);

    useEffect(() => {
        if (userId === null) return; // เช็คว่า userId ถูกเซ็ตแล้ว

        const fetchUserData = async () => {
            try {
                setLoading(true);
                setError(null);

                const userExists = await checkUser(userId);
                console.log("User exists:", userExists);

                if (!userExists) {
                    // หาก userId ไม่มีในระบบ ให้ Redirect ไปหน้า Register
                    router.replace("/Customer-shop/Register"); 
                    return;
                }

                const data = await getMemberById(userId);
                console.log("Fetched user data:", data);

                setUserData(data);
            } catch (error) {
                console.error("Error fetching user data:", error);
                setError("ไม่สามารถดึงข้อมูลได้");
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [userId, router]);

    const handleClose = () => {
        if (liff && liff.isInClient()) {
            liff.closeWindow();
        } else {
            console.error("LIFF is not available or not in LINE Client");
        }
    };

    // ถ้า LIFF ยังไม่พร้อมใช้งานให้แสดง Loading State ก่อน
    if (!isLiffReady) {
        return <p>Loading...</p>;
    }

    return (
        <div className={Style.container}>
            <div className={Style.head}>
                <div className={Style.logostyle}>
                    <Image src={logo} alt="Logo" />
                </div>
                <h1 className={Style.h1}> ข้อมูลของฉัน </h1>
            </div>

            <div className={Style.containerform}>
                <form className={Style.form}>
                    <div className={Style.forminput}>
                        {loading ? (
                            <p>Loading...</p>
                        ) : error ? (
                            <p style={{ color: "red" }}>{error}</p>
                        ) : (
                            <>
                                <div className={Style.group}>
                                    <label> First Name : {userData?.FirstName}</label>
                                </div>
                                <div className={Style.group}>
                                    <label> Last Name : {userData?.LastName}</label>
                                </div>
                                <div className={Style.group}>
                                    <label> Phone Number : {userData?.PhoneNumber}</label>
                                </div>
                                <div className={Style.group}>
                                    <label> Point : {userData?.Point}</label>
                                </div>
                            </>
                        )}
                    </div>
                </form>
            </div>

            <div className={Style.lower}>
                <button className={Style.buttonclose} onClick={handleClose}>
                    Close
                </button>
            </div>
        </div>
    );
}

