package br.com.ludus.checkin.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.ludus.checkin.model.DancingClassEnrollment;
import br.com.ludus.checkin.model.EnrollmentId;

public interface DancingClassEnrollmentRepository extends JpaRepository<DancingClassEnrollment, EnrollmentId> {

    Optional<DancingClassEnrollment> findByDancingClassIdAndStudentId(Long dancingClassId, Long studentId);
}
