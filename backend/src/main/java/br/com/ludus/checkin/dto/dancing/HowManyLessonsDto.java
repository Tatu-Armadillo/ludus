package br.com.ludus.checkin.dto.dancing;

import java.time.LocalDate;

import br.com.ludus.checkin.model.DancingClass;

public record HowManyLessonsDto(
                String level,
                String beat,
                LocalDate lastDay,
                int totalLessons) {

        public static HowManyLessonsDto toDto(final DancingClass entity) {
                return new HowManyLessonsDto(
                                entity.getLevel().name(),
                                entity.getBeat().getName(),
                                entity.getEndDate(),
                                entity.getLessons().size());
        }

}
