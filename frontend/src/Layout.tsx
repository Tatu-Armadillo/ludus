import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from "@/components/layout/Sidebar";
import { ludusApi } from "@/components/api/ludusApi";
import { createPageUrl } from "@/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu, Music2 } from "lucide-react";

export default function Layout({ children, currentPageName }) {
    const navigate = useNavigate();
    const isAuthPage = currentPageName === 'auth';
    const isMobile = useIsMobile();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        if (!isAuthPage && !ludusApi.isAuthenticated()) {
            navigate(createPageUrl('auth'));
        }
    }, [isAuthPage, navigate]);

    useEffect(() => {
        setIsSidebarOpen(false);
    }, [currentPageName]);

    useEffect(() => {
        if (!isMobile) {
            setIsSidebarOpen(false);
            return;
        }

        const previous = document.body.style.overflow;
        document.body.style.overflow = isSidebarOpen ? 'hidden' : previous || '';

        return () => {
            document.body.style.overflow = previous;
        };
    }, [isMobile, isSidebarOpen]);

    useEffect(() => {
        const onEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsSidebarOpen(false);
            }
        };
        globalThis.window.addEventListener('keydown', onEscape);
        return () => globalThis.window.removeEventListener('keydown', onEscape);
    }, []);

    if (isAuthPage) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-50 to-violet-50">
            <Sidebar
                currentPage={currentPageName}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />
            <main className="min-h-screen md:ml-64">
                <div className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/90 backdrop-blur md:hidden">
                    <div className="flex items-center justify-between px-4 py-3">
                        <button
                            type="button"
                            onClick={() => setIsSidebarOpen(true)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700"
                            aria-label="Abrir menu"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <div className="flex items-center gap-2 text-slate-800">
                            <Music2 className="h-5 w-5 text-cyan-600" />
                            <span className="font-semibold">Ludus</span>
                        </div>
                    </div>
                </div>
                <div className="p-4 sm:p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}