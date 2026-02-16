package br.com.ludus.checkin.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.com.ludus.checkin.model.Lesson;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {

    @Override
    @Modifying
    @Query("UPDATE Lesson l SET l.deleted = true WHERE l.id = :id")
    void deleteById(@Param("id") Long id);

    Page<Lesson> findAllByDancingClassId(Pageable pageable, Long dancingClassId);

    List<Lesson> findAllByDancingClassIdAndDayGreaterThanEqual(Long dancingClassId, LocalDate today);

}
