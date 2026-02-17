const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || 'http://localhost:9090/api';

export interface DashboardStats {
    totalStudents: number;
    totalClasses: number;
    activeEnrollments: number;
}

export interface ClassStatusItem {
    id: number;
    name: string;
    endDate: string;
    remainingLessons: number;
    status: string;
}

class LudusApi {
    token: string | null;

    constructor() {
        this.token = localStorage.getItem('ludus_token');
    }

    setToken(token: string): void {
        this.token = token;
        localStorage.setItem('ludus_token', token);
    }

    clearToken(): void {
        this.token = null;
        localStorage.removeItem('ludus_token');
    }

    getHeaders(): Record<string, string> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        const token = this.token ?? (typeof localStorage !== 'undefined' ? localStorage.getItem('ludus_token') : null);
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }

    async request(endpoint: string, options: RequestInit = {}): Promise<any> {
        const url = `${API_BASE_URL}${endpoint}`;
        let response: Response;
        try {
            response = await fetch(url, {
                ...options,
                headers: this.getHeaders(),
            });
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            if (msg === 'Failed to fetch' || msg.includes('NetworkError') || msg.includes('ERR_EMPTY_RESPONSE')) {
                throw new Error(`Backend inacessível. Verifique se está rodando em ${API_BASE_URL.replace(/\/api\/?$/, '')} e se a porta está correta.`);
            }
            throw err;
        }

        if (response.status === 401) {
            this.clearToken();
            globalThis.location.href = '/Auth';
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const text = await response.text();
        return text ? JSON.parse(text) : null;
    }

    // Auth
    async login(username: string, password: string): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        console.log(response.ok)

        if (!response.ok) {
            throw new Error('Login failed');
        }

        const token =   response.headers.get("AUTHORIZATION");

        this.setToken(token);
        return token;
    }

    // Students
    async getStudents(page = 0, size = 10) {
        return this.request(`/student?page=${page}&size=${size}`);
    }

    async getStudentsByClass(classId, page = 0, size = 10) {
        return this.request(`/student/dancing-class?id=${classId}&page=${page}&size=${size}`);
    }

    async createStudent(data) {
        return this.request('/student', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async deleteStudent(id) {
        return this.request(`/student/${id}`, { method: 'DELETE' });
    }

    // Dancing Classes
    async getDancingClasses(page = 0, size = 10, filters = {}) {
        const params = new URLSearchParams({ page, size });
        if (filters.level) params.append('level', filters.level);
        if (filters.status) params.append('status', filters.status);
        if (filters.dayWeek) params.append('dayWeek', filters.dayWeek);
        if (filters.beatName) params.append('beatName', filters.beatName);
        return this.request(`/dancing-class?${params.toString()}`);
    }

    async createDancingClass(data) {
        return this.request('/dancing-class', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async registerStudents(dancingClassId, studentIds) {
        return this.request('/dancing-class/students', {
            method: 'PATCH',
            body: JSON.stringify({ dancingClassId, studentIds }),
        });
    }

    async deleteDancingClass(id) {
        return this.request(`/dancing-class/${id}`, { method: 'DELETE' });
    }

    async getClassesStatus(signal?: AbortSignal): Promise<ClassStatusItem[]> {
        return this.request('/dancing-class/status', { signal });
    }

    // Lessons
    async getLessons(dancingClassId, page = 0, size = 10) {
        return this.request(`/lessons?id=${dancingClassId}&page=${page}&size=${size}`);
    }

    async createLesson(data) {
        return this.request('/lessons', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async deleteLesson(id) {
        return this.request(`/lessons/${id}`, { method: 'DELETE' });
    }

    // Beats
    async getBeats(page = 0, size = 50) {
        return this.request(`/beat?page=${page}&size=${size}`);
    }

    // Dashboard
    async getDashboardStats(signal?: AbortSignal): Promise<DashboardStats> {
        return this.request('/dashboard/stats', { signal });
    }

    async createBeat(name) {
        return this.request('/beat', {
            method: 'POST',
            body: JSON.stringify(name),
        });
    }

    async deleteBeat(id) {
        return this.request(`/beat/${id}`, { method: 'DELETE' });
    }

    isAuthenticated() {
        return !!this.token;
    }
}

export const ludusApi = new LudusApi();