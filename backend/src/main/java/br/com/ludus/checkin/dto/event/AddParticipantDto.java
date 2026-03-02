package br.com.ludus.checkin.dto.event;

import java.math.BigDecimal;

public record AddParticipantDto(
        Long studentId,
        String externalParticipantName,
        BigDecimal amountPaid
) {
}
