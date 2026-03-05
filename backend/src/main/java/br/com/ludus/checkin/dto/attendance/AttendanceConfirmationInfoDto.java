package br.com.ludus.checkin.dto.attendance;

public record AttendanceConfirmationInfoDto(
        String studentName,
        String className,
        String weekday,
        String time) {
}
