"use client";

import { useState, useEffect } from "react";

export function useDeviceDetection() {
    const [isIOS, setIsIOS] = useState(false);
    const [isPhone, setIsPhone] = useState(false);
    const [isIPad, setIsIPad] = useState(false);
    
    useEffect(() => {
        if (typeof navigator === "undefined") return;
        const ua = navigator.userAgent;
        const ipad = /iPad/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
        const iphone = /iPhone|iPod/i.test(ua);
        const androidPhone = /Android/i.test(ua) && /Mobile/i.test(ua);
        
        setIsIOS(ipad || iphone);
        setIsPhone(iphone || androidPhone || window.innerWidth < 768);
        setIsIPad(ipad);
    }, []);

    return { isIOS, isPhone, isIPad };
}
