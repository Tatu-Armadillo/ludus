package br.com.ludus.checkin.dto.dancing;

import java.time.LocalDate;

import br.com.ludus.checkin.enums.LevelDancingEnum;
import jakarta.validation.constraints.NotNull;

public record ProgressClassDto(
        @NotNull(message = "Novo nível é obrigatório")
        LevelDancingEnum newLevel,
        @NotNull(message = "Data de início é obrigatória")
        LocalDate startDate,
        @NotNull(message = "Data de fim é obrigatória")
        LocalDate endDate) {
}
