package br.com.ludus.checkin.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.com.ludus.checkin.model.Participation;

@Repository
public interface ParticipationRepository extends JpaRepository<Participation, Long> {

    @Override
    @Modifying
    @Query("UPDATE Participation p SET p.deleted = true WHERE p.id = :id")
    void deleteById(@Param("id") Long id);

}
