package br.com.ludus.checkin.dto.dancing;

import java.time.*;

import br.com.ludus.checkin.enums.*;
import br.com.ludus.checkin.model.DancingClass;

public record DancingClassCreateDto(
                LevelDancingEnum level,
                StatusDancingEnum status,
                DayOfWeek dayWeek,
                LocalTime startSchedule,
                LocalTime endSchedule,
                LocalDate startDate,
                LocalDate endDate,
                Long beatId) {

        public DancingClass toEntity() {
                final var entity = new DancingClass();
                entity.setLevel(this.level);
                entity.setStatus(this.status);
                entity.setDayWeek(this.dayWeek);
                entity.setStartSchedule(this.startSchedule);
                entity.setEndSchedule(this.endSchedule);
                entity.setStartDate(this.startDate);
                entity.setEndDate(this.endDate);
                return entity;
        }
}
