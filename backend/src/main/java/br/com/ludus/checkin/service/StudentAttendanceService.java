package br.com.ludus.checkin.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.ludus.checkin.dto.attendance.StudentAttendanceItemDto;
import br.com.ludus.checkin.dto.attendance.UpdateAttendanceDto;
import br.com.ludus.checkin.dto.lesson.LessonCreateDto;
import br.com.ludus.checkin.enums.AttendanceStatusEnum;
import br.com.ludus.checkin.model.DancingClass;
import br.com.ludus.checkin.model.DancingClassEnrollment;
import br.com.ludus.checkin.model.Student;
import br.com.ludus.checkin.model.StudentAttendance;
import br.com.ludus.checkin.repository.DancingClassEnrollmentRepository;
import br.com.ludus.checkin.repository.LessonRepository;
import br.com.ludus.checkin.repository.StudentAttendanceRepository;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class StudentAttendanceService {

    private static final String PENDENTE = AttendanceStatusEnum.PENDENTE.name();

    private final StudentAttendanceRepository attendanceRepository;
    private final DancingClassEnrollmentRepository enrollmentRepository;
    private final DancingClassService dancingClassService;
    private final StudentService studentService;
    private final LessonRepository lessonRepository;

    @Transactional(readOnly = true)
    public List<StudentAttendanceItemDto> listByClassAndDate(Long classId, LocalDate attendanceDate) {
        dancingClassService.findById(classId);

        List<DancingClassEnrollment> enrollments = enrollmentRepository.findByDancingClassIdOrderByStudentName(classId);
        List<StudentAttendance> attendances = attendanceRepository.findByClassIdAndAttendanceDate(classId, attendanceDate);
        Map<Long, String> statusByStudentId = attendances.stream()
                .collect(Collectors.toMap(sa -> sa.getStudent().getId(), sa -> sa.getStatus().name()));

        return enrollments.stream()
                .map(e -> {
                    Long studentId = e.getStudent().getId();
                    String status = statusByStudentId.getOrDefault(studentId, PENDENTE);
                    return new StudentAttendanceItemDto(
                            studentId,
                            e.getStudent().getName(),
                            e.getRole() != null ? e.getRole() : "CONDUCTED",
                            status);
                })
                .toList();
    }

    @Transactional(rollbackFor = Exception.class)
    public StudentAttendance createOrUpdate(UpdateAttendanceDto dto) {
        AttendanceStatusEnum status = AttendanceStatusEnum.valueOf(dto.status().toUpperCase());

        ensureLessonExists(dto.classId(), dto.attendanceDate());

        return attendanceRepository
                .findByStudentIdAndClassIdAndAttendanceDate(dto.studentId(), dto.classId(), dto.attendanceDate())
                .map(existing -> {
                    existing.setStatus(status);
                    return attendanceRepository.save(existing);
                })
                .orElseGet(() -> {
                    Student student = studentService.findById(dto.studentId());
                    StudentAttendance sa = new StudentAttendance();
                    sa.setStudent(student);
                    sa.setDancingClass(dancingClassService.findById(dto.classId()));
                    sa.setAttendanceDate(dto.attendanceDate());
                    sa.setStatus(status);
                    return attendanceRepository.save(sa);
                });
    }

    private void ensureLessonExists(Long classId, LocalDate attendanceDate) {
        lessonRepository.findByDancingClassIdAndDay(classId, attendanceDate)
                .orElseGet(() -> {
                    DancingClass dancingClass = dancingClassService.findById(classId);
                    LessonCreateDto dto = new LessonCreateDto(
                            attendanceDate,
                            dancingClass.getStartSchedule(),
                            dancingClass.getEndSchedule(),
                            classId);
                    var lesson = dto.toEntity();
                    lesson.setDancingClass(dancingClass);
                    return lessonRepository.save(lesson);
                });
    }
}
