package br.com.ludus.checkin.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.com.ludus.checkin.model.StudentAttendance;

@Repository
public interface StudentAttendanceRepository extends JpaRepository<StudentAttendance, Long> {

    @Query("SELECT sa FROM StudentAttendance sa WHERE sa.dancingClass.id = :classId AND sa.attendanceDate = :attendanceDate")
    List<StudentAttendance> findByClassIdAndAttendanceDate(
            @Param("classId") Long classId,
            @Param("attendanceDate") LocalDate attendanceDate);

    @Query("SELECT sa FROM StudentAttendance sa WHERE sa.student.id = :studentId AND sa.dancingClass.id = :classId AND sa.attendanceDate = :attendanceDate")
    Optional<StudentAttendance> findByStudentIdAndClassIdAndAttendanceDate(
            @Param("studentId") Long studentId,
            @Param("classId") Long classId,
            @Param("attendanceDate") LocalDate attendanceDate);
}
