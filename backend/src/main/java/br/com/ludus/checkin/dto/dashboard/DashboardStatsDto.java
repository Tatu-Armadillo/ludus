package br.com.ludus.checkin.dto.dashboard;

public record DashboardStatsDto(
        long totalStudents,
        long totalClasses,
        long activeEnrollments) {
}
