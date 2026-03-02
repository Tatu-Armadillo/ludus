package br.com.ludus.checkin.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.ludus.checkin.model.EventParticipant;

@Repository
public interface EventParticipantRepository extends JpaRepository<EventParticipant, Long> {

    Optional<EventParticipant> findByEvent_IdAndStudent_Id(Long eventId, Long studentId);
}
