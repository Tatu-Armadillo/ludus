package br.com.ludus.checkin.model;

import com.fasterxml.jackson.annotation.JsonBackReference;

import org.hibernate.annotations.NotFound;
import org.hibernate.annotations.NotFoundAction;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "event_participant", schema = "checkin")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventParticipant {

    @EmbeddedId
    private EventParticipantId id;

    @JsonBackReference
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("eventId")
    @JoinColumn(name = "id_event", foreignKey = @ForeignKey(name = "fk_event_participant_event"))
    private Event event;

    @NotFound(action = NotFoundAction.IGNORE)
    @ManyToOne(fetch = FetchType.EAGER)
    @MapsId("studentId")
    @JoinColumn(name = "id_student", foreignKey = @ForeignKey(name = "fk_event_participant_student"))
    private Student student;
}
