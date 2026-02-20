package br.com.ludus.checkin.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.ludus.checkin.model.EventParticipant;
import br.com.ludus.checkin.model.EventParticipantId;

@Repository
public interface EventParticipantRepository extends JpaRepository<EventParticipant, EventParticipantId> {

    Optional<EventParticipant> findByEventIdAndStudentId(Long eventId, Long studentId);
}
