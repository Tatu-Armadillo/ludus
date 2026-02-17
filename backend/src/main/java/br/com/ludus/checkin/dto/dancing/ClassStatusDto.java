package br.com.ludus.checkin.dto.dancing;

import java.time.LocalDate;

public record ClassStatusDto(
        Long id,
        String name,
        LocalDate endDate,
        int remainingLessons,
        String status) {
}
