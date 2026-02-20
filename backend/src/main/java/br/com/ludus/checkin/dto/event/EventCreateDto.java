package br.com.ludus.checkin.dto.event;

import java.time.LocalDate;
import java.time.LocalTime;

import br.com.ludus.checkin.enums.EventStatusEnum;
import br.com.ludus.checkin.model.Event;

public record EventCreateDto(
        String name,
        LocalDate eventDate,
        LocalTime eventTime,
        Boolean hasMaxParticipants,
        Integer maxParticipants,
        EventStatusEnum status) {

    public Event toEntity() {
        final var entity = new Event();
        entity.setName(this.name);
        entity.setEventDate(this.eventDate);
        entity.setEventTime(this.eventTime);
        boolean hasLimit = this.hasMaxParticipants == null || this.hasMaxParticipants;
        entity.setHasMaxParticipants(hasLimit);
        entity.setMaxParticipants(hasLimit && this.maxParticipants != null && this.maxParticipants > 0
                ? this.maxParticipants
                : 0);
        entity.setStatus(this.status != null ? this.status : EventStatusEnum.IN_PROGRESS);
        return entity;
    }
}
