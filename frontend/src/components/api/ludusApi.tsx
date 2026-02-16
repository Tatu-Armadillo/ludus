const API_BASE_URL = 'http://localhost:9090/api';

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
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }

    async request(endpoint: string, options: RequestInit = {}): Promise<any> {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: this.getHeaders(),
        });

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

    // Lessons
    async getLessons(dancingClassId, page = 0, size = 10) {
        return this.request(`/Lessons?id=${dancingClassId}&page=${page}&size=${size}`);
    }

    async createLesson(data) {
        return this.request('/Lessons', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async deleteLesson(id) {
        return this.request(`/Lessons/${id}`, { method: 'DELETE' });
    }

    // Beats
    async getBeats(page = 0, size = 50) {
        return this.request(`/beat?page=${page}&size=${size}`);
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