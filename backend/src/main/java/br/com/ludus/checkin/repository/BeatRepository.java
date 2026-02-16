package br.com.ludus.checkin.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.com.ludus.checkin.model.Beat;

@Repository
public interface BeatRepository extends JpaRepository<Beat, Long> {

    @Override
    @Modifying
    @Query("UPDATE Beat b SET b.deleted = true WHERE b.id = :id")
    void deleteById(@Param("id") Long id);

}
