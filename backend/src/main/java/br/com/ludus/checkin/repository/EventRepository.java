package br.com.ludus.checkin.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.com.ludus.checkin.model.Event;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    @Override
    @Modifying
    @Query("UPDATE Event e SET e.deleted = true WHERE e.id = :id")
    void deleteById(@Param("id") Long id);
}
