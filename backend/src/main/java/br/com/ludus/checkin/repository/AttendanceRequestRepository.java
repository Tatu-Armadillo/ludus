package br.com.ludus.checkin.repository;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.ludus.checkin.model.AttendanceRequest;

@Repository
public interface AttendanceRequestRepository extends JpaRepository<AttendanceRequest, Long> {

    Optional<AttendanceRequest> findByTokenHash(String tokenHash);

    Optional<AttendanceRequest> findByDancingClassIdAndStudentIdAndDate(Long classId, Long studentId, LocalDate date);
}
