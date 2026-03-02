package br.com.ludus.checkin.dto.student;

import java.time.LocalDate;

public record StudentUpdateDto(
        String name,
        String contact,
        LocalDate birth,
        String email) {
}

