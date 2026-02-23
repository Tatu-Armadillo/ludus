package br.com.ludus.checkin.dto.attendance;

public record StudentAttendanceItemDto(
        Long studentId,
        String studentName,
        String role,
        String status) {
}
