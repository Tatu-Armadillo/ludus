package br.com.ludus.checkin.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.ludus.checkin.dto.dancing.ClassStatusDto;
import br.com.ludus.checkin.dto.dancing.DancingClassCreateDto;
import br.com.ludus.checkin.dto.dancing.EnrollmentItemDto;
import br.com.ludus.checkin.enums.StatusDancingEnum;
import br.com.ludus.checkin.model.DancingClass;
import br.com.ludus.checkin.model.DancingClassEnrollment;
import br.com.ludus.checkin.model.EnrollmentId;
import br.com.ludus.checkin.model.Student;
import br.com.ludus.checkin.repository.DancingClassEnrollmentRepository;
import br.com.ludus.checkin.repository.DancingClassRepository;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class DancingClassService {

    private final DancingClassRepository dancingClassRepository;
    private final DancingClassEnrollmentRepository enrollmentRepository;
    private final StudentService studentService;
    private final BeatService beatService;

    public DancingClass create(DancingClassCreateDto dto) {
        final var entity = dto.toEntity();
        final var beat = this.beatService.findById(dto.beatId());
        entity.setBeat(beat);
        return this.dancingClassRepository.save(entity);
    }

    public List<DancingClass> findAll(Pageable pageable, String level, String status, String dayWeek, String beatName) {
        return this.dancingClassRepository.findAllByFilters(pageable, level, status, dayWeek, beatName).toList();
    }

    public List<DancingClass> findHowManyLessonsAreLeft() {
        return this.dancingClassRepository.findHowManyLessonsAreLeft(StatusDancingEnum.IN_PROGRESS, LocalDate.now());
    }

    public DancingClass findById(Long id) {
        return this.dancingClassRepository.findById(id).orElseThrow();
    }

    public void delete(Long id) {
        this.dancingClassRepository.deleteById(id);
    }

    public DancingClass registerStudents(Long dancingId, List<EnrollmentItemDto> enrollments) {
        final var dancingClass = this.findById(dancingId);
        if (dancingClass.getEnrollments() == null) {
            dancingClass.setEnrollments(new ArrayList<>());
        }
        for (EnrollmentItemDto dto : enrollments) {
            var opt = this.enrollmentRepository.findByDancingClassIdAndStudentId(dancingId, dto.studentId());
            String role = dto.role() != null && !dto.role().isBlank() ? dto.role() : "CONDUCTED";
            if (opt.isPresent()) {
                opt.get().setRole(role);
                this.enrollmentRepository.save(opt.get());
            } else {
                Student student = this.studentService.findById(dto.studentId());
                DancingClassEnrollment e = new DancingClassEnrollment();
                e.setId(new EnrollmentId(dancingId, dto.studentId()));
                e.setDancingClass(dancingClass);
                e.setStudent(student);
                e.setRole(role);
                this.enrollmentRepository.save(e);
                dancingClass.getEnrollments().add(e);
            }
        }
        return this.findById(dancingId);
    }

    @Transactional(readOnly = true)
    public List<ClassStatusDto> findAllForStatusDashboard() {
        final var today = LocalDate.now();
        final var cutoff = today.minusDays(30);
        final var classes = this.dancingClassRepository.findAllForStatusDashboard(
                StatusDancingEnum.IN_PROGRESS,
                StatusDancingEnum.COMPLETED,
                cutoff);

        return classes.stream()
                .map(dc -> toClassStatusDto(dc, today))
                .toList();
    }

    private static ClassStatusDto toClassStatusDto(DancingClass dc, LocalDate today) {
        final var name = dc.getBeat() != null ? dc.getBeat().getName() : "Turma";
        final var endDate = dc.getEndDate() != null ? dc.getEndDate() : today;
        final int remainingLessons = countWeekdaysBetween(today, endDate,
                dc.getDayWeek() != null ? dc.getDayWeek() : null);
        final var status = dc.getStatus() != null ? dc.getStatus().name() : StatusDancingEnum.IN_PROGRESS.name();
        final var dayWeek = dc.getDayWeek() != null ? dc.getDayWeek().name() : null;
        return new ClassStatusDto(dc.getId(), name, endDate, remainingLessons, status, dayWeek);
    }

    /** Counts how many times the given weekday occurs between start (inclusive) and end (inclusive). */
    private static int countWeekdaysBetween(LocalDate start, LocalDate end, java.time.DayOfWeek dayOfWeek) {
        if (dayOfWeek == null || start.isAfter(end)) return 0;
        int count = 0;
        for (LocalDate d = start; !d.isAfter(end); d = d.plusDays(1)) {
            if (d.getDayOfWeek() == dayOfWeek) count++;
        }
        return count;
    }

}
