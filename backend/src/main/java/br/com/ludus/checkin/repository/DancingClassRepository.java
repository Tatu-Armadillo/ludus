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

import br.com.ludus.checkin.enums.StatusDancingEnum;
import br.com.ludus.checkin.model.DancingClass;

@Repository
public interface DancingClassRepository extends JpaRepository<DancingClass, Long> {

  @Override
  @Modifying
  @Query("UPDATE DancingClass dc SET dc.deleted = true WHERE dc.id = :id")
  void deleteById(@Param("id") Long id);

  @Query("""
          SELECT dancingClass
          FROM DancingClass dancingClass
          LEFT JOIN dancingClass.beat beat
          WHERE (:level IS NULL OR LOWER(dancingClass.level) LIKE LOWER(CONCAT('%', :level, '%')))
            AND (:status IS NULL OR LOWER(dancingClass.status) LIKE LOWER(CONCAT('%', :status, '%')))
            AND (:dayWeek IS NULL OR LOWER(dancingClass.dayWeek) LIKE LOWER(CONCAT('%', :dayWeek, '%')))
            AND (:beatName IS NULL OR LOWER(beat.name) LIKE LOWER(CONCAT('%', :beatName, '%')))
      """)
  Page<DancingClass> findAllByFilters(
      Pageable pageable,
      @Param("level") String level,
      @Param("status") String status,
      @Param("dayWeek") String dayWeek,
      @Param("beatName") String beatName);

  @Query("""
      SELECT dancingClass FROM DancingClass dancingClass
      LEFT JOIN dancingClass.lessons lesson
      WHERE dancingClass.status = :status
      AND lesson.day >= :today
      """)
  List<DancingClass> findHowManyLessonsAreLeft(
      @Param("status") StatusDancingEnum status,
      @Param("today") LocalDate today);

  @Query(value = "SELECT COUNT(*) FROM checkin.dancing_class_student", nativeQuery = true)
  long countActiveEnrollments();

  @Query("""
      SELECT dc FROM DancingClass dc
      LEFT JOIN FETCH dc.beat
      WHERE dc.status = :inProgress
         OR (dc.status = :completed AND dc.endDate >= :cutoff)
      ORDER BY dc.endDate ASC
      """)
  List<DancingClass> findAllForStatusDashboard(
      @Param("inProgress") StatusDancingEnum inProgress,
      @Param("completed") StatusDancingEnum completed,
      @Param("cutoff") LocalDate cutoff);

}
