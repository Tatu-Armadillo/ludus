package br.com.ludus.checkin.model;

import com.fasterxml.jackson.annotation.JsonBackReference;

import java.math.BigDecimal;

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

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @JsonBackReference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_event", foreignKey = @ForeignKey(name = "fk_event_participant_event"))
    private Event event;

    @NotFound(action = NotFoundAction.IGNORE)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_student", foreignKey = @ForeignKey(name = "fk_event_participant_student"))
    private Student student;

    @Column(name = "external_participant_name")
    private String externalParticipantName;

    @Column(name = "amount_paid")
    private BigDecimal amountPaid;
}
