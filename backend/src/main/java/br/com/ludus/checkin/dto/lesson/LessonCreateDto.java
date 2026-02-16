package br.com.ludus.checkin.dto.lesson;

import java.time.LocalDate;
import java.time.LocalTime;

import br.com.ludus.checkin.model.Lesson;

public record LessonCreateDto(
        LocalDate day,
        LocalTime startSchedule,
        LocalTime endSchedule,
        Long dancingClassId) {

        public Lesson toEntity() {
            final var entity = new Lesson();
            entity.setDay(this.day);
            entity.setStartSchedule(this.startSchedule);
            entity.setEndSchedule(this.endSchedule);
            return entity;
        }

}
