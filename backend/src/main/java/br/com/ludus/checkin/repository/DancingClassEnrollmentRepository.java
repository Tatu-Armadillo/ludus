package br.com.ludus.checkin.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.com.ludus.checkin.model.DancingClassEnrollment;
import br.com.ludus.checkin.model.EnrollmentId;

public interface DancingClassEnrollmentRepository extends JpaRepository<DancingClassEnrollment, EnrollmentId> {

    Optional<DancingClassEnrollment> findByDancingClassIdAndStudentId(Long dancingClassId, Long studentId);

    @Query("SELECT e FROM DancingClassEnrollment e JOIN FETCH e.student WHERE e.id.dancingClassId = :classId ORDER BY e.student.name")
    List<DancingClassEnrollment> findByDancingClassIdOrderByStudentName(@Param("classId") Long classId);
}
