package br.com.ludus.checkin.model;

import java.io.Serializable;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventParticipantId implements Serializable {

    private Long eventId;
    private Long studentId;
}
