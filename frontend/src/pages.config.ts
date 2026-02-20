import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import DancingClasses from './pages/DancingClasses';
import ClassEnrollment from './pages/ClassEnrollment';
import Lessons from './pages/Lessons';
import Beats from './pages/Beats';
import Events from './pages/Events';
import Auth from './pages/Auth';
import __Layout from './Layout';


export const PAGES = {
    "dashboard": Dashboard,
    "students": Students,
    "dancing-classes": DancingClasses,
    "class-enrollment": ClassEnrollment,
    "lessons": Lessons,
    "beats": Beats,
    "events": Events,
    "auth": Auth,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};