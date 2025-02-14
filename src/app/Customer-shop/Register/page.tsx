"use client";

import Style from "@/Style/Register.module.css";
import Image from "next/image";
import logo from "@/public/logo.png";
import { useState, useEffect } from "react";
import { saveUserData, checkUser } from "@/service/Register";
import liff from "@line/liff";

export default function Register() {
    const [loading, setLoading] = useState(true);
    const [userExists, setUserExists] = useState(false);
    const [, setProfile] = useState<unknown | null>(null);
    
    const [userData, setUserData] = useState({
        FirstName: "",
        LastName: "",
        PhoneNumber: "",
        userId: ""
    });

    useEffect(() => {
        async function initializeLiff() {
            try {
                const liffId = process.env.NEXT_PUBLIC_LIFF_ID_1;
                if (!liffId) {
                    throw new Error("LIFF ID is not defined.");
                }
    
                await liff.init({ liffId });
    
                if (!liff.isLoggedIn()) {
                    liff.login(); // บังคับให้ล็อกอินถ้ายังไม่ได้ล็อกอิน
                    return;
                }
    
                const userProfile = await liff.getProfile();
                const userId = userProfile.userId;
    
                localStorage.setItem("userId", userId);
    
                setProfile(userProfile);
                setUserData((prevData) => ({
                    ...prevData,
                    userId
                }));
    
                const exists = await checkUser(userId);
                setUserExists(exists);
            } catch (error) {
                console.error("LIFF initialization failed:", error);
            } finally {
                setLoading(false);
            }
        }
    
        initializeLiff();
    }, []);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userData.FirstName || !userData.LastName || !userData.PhoneNumber || !userData.userId) {
            alert("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }

        try {
            await saveUserData(userData);
            alert("ลงทะเบียนสำเร็จ!");
            setUserExists(true);
        } catch (error) {
            console.error("เกิดข้อผิดพลาด:", error);
            alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        }
    };

    if (loading) {
        return <div className={Style.loading}>กำลังโหลด...</div>;
    }

    return (
        <div className={Style.container}>
            <div className={Style.Image}>
                <div className={Style.logostyle}>
                    <Image src={logo} alt="Logo" />
                </div>
                <h1 className={Style.h1}>สมัครสมาชิก</h1>
            </div>
            {userExists ? (
                <p className={Style.error}>คุณได้ลงทะเบียนแล้ว</p>
            ) : (
                <form onSubmit={handleSubmit} className={Style.formgroup}>
                    <div className={Style.groupname}>
                        <div className={Style.FirstName}>
                            <label className={Style.label}>First Name</label>
                            <input
                                type="text"
                                className={Style.information}
                                name="FirstName"
                                value={userData.FirstName}
                                onChange={handleChange}
                            />
                        </div>
                        <div className={Style.LastName}>
                            <label className={Style.label}>Last Name</label>
                            <input
                                type="text"
                                className={Style.information}
                                name="LastName"
                                value={userData.LastName}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div className={Style.PhoneNumber}>
                        <label className={Style.label}>Phone Number</label>
                        <input
                            type="text"
                            className={Style.information}
                            name="PhoneNumber"
                            value={userData.PhoneNumber}
                            onChange={handleChange}
                        />
                    </div>
                    <button type="submit" className={Style.buttonS}>ยืนยัน</button>
                </form>
            )}
        </div>
    );
}
