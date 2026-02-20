package br.com.ludus.checkin.model;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.hibernate.annotations.SQLRestriction;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import br.com.ludus.checkin.enums.EventStatusEnum;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "event", schema = "checkin")
@SQLRestriction("is_deleted = false")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Event {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "event_date", nullable = false)
    private LocalDate eventDate;

    @Column(name = "event_time", nullable = false)
    private LocalTime eventTime;

    @Column(name = "has_max_participants", nullable = false)
    private Boolean hasMaxParticipants = true;

    @Column(name = "max_participants", nullable = false)
    private Integer maxParticipants = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private EventStatusEnum status = EventStatusEnum.IN_PROGRESS;

    @Column(name = "is_deleted")
    private boolean deleted;

    @JsonManagedReference
    @OneToMany(mappedBy = "event", fetch = FetchType.EAGER, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EventParticipant> participants;
}
