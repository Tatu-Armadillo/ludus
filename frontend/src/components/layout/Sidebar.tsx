import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    Calendar,
    Music,
    LogOut,
    Music2,
    ChevronRight,
    PartyPopper
} from "lucide-react";
import { ludusApi } from "@/components/api/ludusApi";

const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, page: 'Dashboard' },
    { name: 'Alunos', icon: Users, page: 'Students' },
    { name: 'Turmas', icon: GraduationCap, page: 'DancingClasses' },
    { name: 'Aulas', icon: Calendar, page: 'Lessons' },
    { name: 'Ritmos', icon: Music, page: 'Beats' },
    { name: 'Eventos', icon: PartyPopper, page: 'Events' },
];

export default function Sidebar({ currentPage }) {
    const location = useLocation();

    const handleLogout = () => {
        ludusApi.clearToken();
        globalThis.location.href = createPageUrl('Auth');
    };

    return (
        <aside className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-cyan-900 to-blue-900 border-r border-white/10 flex flex-col z-50">
            {/* Logo */}
            <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30">
                        <Music2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-lg tracking-tight">Ludus</h1>
                        <p className="text-violet-300/60 text-xs">Checkin System</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {menuItems.map((item) => {
                    const isActive = currentPage === item.page;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.page}
                            to={createPageUrl(item.page)}
                            className="block"
                        >
                            <motion.div
                                whileHover={{ x: 4 }}
                                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive
                                        ? 'bg-gradient-to-r from-cyan-600/30 to-blue-600/30 text-white border border-cyan-500/30'
                                        : 'text-cyan-300/70 hover:text-white hover:bg-white/5'
                                    }
                `}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-500' : ''}`} />
                                <span className="font-medium">{item.name}</span>
                                {isActive && (
                                    <ChevronRight className="w-4 h-4 ml-auto text-cyan-400" />
                                )}
                            </motion.div>
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-white/10">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-cyan-300/70 hover:text-red-600 hover:bg-red-500/10 hover:border hover:border-red-600 transition-all duration-200 w-full"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sair</span>
                </button>
            </div>
        </aside>
    );
}