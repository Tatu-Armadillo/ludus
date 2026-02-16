import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from "@/components/layout/Sidebar";
import { ludusApi } from "@/components/api/ludusApi";
import { createPageUrl } from "@/utils";

export default function Layout({ children, currentPageName }) {
    const navigate = useNavigate();
    const isAuthPage = currentPageName === 'Auth';

    useEffect(() => {
        if (!isAuthPage && !ludusApi.isAuthenticated()) {
            navigate(createPageUrl('Auth'));
        }
    }, [isAuthPage, navigate]);

    if (isAuthPage) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50">
            <Sidebar currentPage={currentPageName} />
            <main className="ml-64 min-h-screen">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}