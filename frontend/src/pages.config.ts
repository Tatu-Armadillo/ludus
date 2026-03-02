import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import DancingClasses from './pages/DancingClasses';
import ClassEnrollment from './pages/ClassEnrollment';
import StudentAttendance from './pages/StudentAttendance';
import ClassAttendance from './pages/ClassAttendance';
import Beats from './pages/Beats';
import Events from './pages/Events';
import EventParticipants from './pages/EventParticipants';
import Auth from './pages/Auth';
import __Layout from './Layout';


export const PAGES = {
    "dashboard": Dashboard,
    "students": Students,
    "dancing-classes": DancingClasses,
    "class-enrollment": ClassEnrollment,
    "student-attendance": StudentAttendance,
    "class-attendance": ClassAttendance,
    "beats": Beats,
    "events": Events,
    "event-participants": EventParticipants,
    "auth": Auth,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};