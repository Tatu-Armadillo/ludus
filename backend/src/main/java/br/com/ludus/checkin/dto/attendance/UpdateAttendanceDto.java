package br.com.ludus.checkin.dto.attendance;

import java.time.LocalDate;

public record UpdateAttendanceDto(
        Long studentId,
        Long classId,
        LocalDate attendanceDate,
        String status) {
}
