package br.com.ludus.checkin.dto.attendance;

import java.time.LocalDate;

public record SendAttendanceResponseDto(
        LocalDate attendanceDate,
        int totalStudents,
        int sentMessages) {
}
