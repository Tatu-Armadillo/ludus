package br.com.ludus.checkin.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.EntityManager;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.ludus.checkin.dto.dancing.ClassStatusDto;
import br.com.ludus.checkin.dto.dancing.DancingClassCreateDto;
import br.com.ludus.checkin.dto.dancing.EnrollmentItemDto;
import br.com.ludus.checkin.dto.dancing.ProgressClassDto;
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
    private final EntityManager entityManager;

    public DancingClass create(DancingClassCreateDto dto) {
        final var entity = dto.toEntity();
        final var beat = this.beatService.findById(dto.beatId());
        entity.setBeat(beat);
        return this.dancingClassRepository.save(entity);
    }

    public List<DancingClass> findAll(Pageable pageable, String level, String status, String dayWeek, String beatName) {
        if (level == null && status == null && dayWeek == null && beatName == null) {
            Pageable byId = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by("id"));
            return this.dancingClassRepository.findAllForList(byId).toList();
        }
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

    public DancingClass setArchived(Long id, boolean archived) {
        DancingClass entity = this.findById(id);
        entity.setArchived(archived);
        return this.dancingClassRepository.save(entity);
    }

    public DancingClass registerStudents(Long dancingId, List<EnrollmentItemDto> enrollments) {
        final var dancingClass = this.findById(dancingId);
        if (dancingClass.getEnrollments() == null) {
            dancingClass.setEnrollments(new ArrayList<>());
        }
        for (EnrollmentItemDto dto : enrollments) {
            Long studentId = dto.studentId();
            String role = dto.role() != null && !dto.role().isBlank() ? dto.role() : "CONDUCTED";
            EnrollmentId enrollmentId = new EnrollmentId(dancingId, studentId);

            // findById usa apenas a PK; evita JOIN com Student e retorna o enrollment mesmo se o aluno estiver soft-deleted
            DancingClassEnrollment existing = this.enrollmentRepository
                    .findById(enrollmentId)
                    .orElseGet(() -> findEnrollmentInCollection(dancingClass, studentId));

            if (existing != null) {
                existing.setRole(role);
                existing.setStudent(this.studentService.findById(studentId));
                this.enrollmentRepository.save(existing);
            } else {
                Student student = this.studentService.findById(studentId);
                DancingClassEnrollment e = new DancingClassEnrollment();
                e.setId(enrollmentId);
                e.setDancingClass(dancingClass);
                e.setStudent(student);
                e.setRole(role);
                this.enrollmentRepository.save(e);
            }
        }
        return this.findById(dancingId);
    }

    private DancingClassEnrollment findEnrollmentInCollection(DancingClass dancingClass, Long studentId) {
        if (dancingClass.getEnrollments() == null) return null;
        return dancingClass.getEnrollments().stream()
                .filter(en -> en.getId() != null && studentId.equals(en.getId().getStudentId()))
                .findFirst()
                .orElse(null);
    }

    public void removeStudentFromClass(Long dancingClassId, Long studentId) {
        this.enrollmentRepository.findByDancingClassIdAndStudentId(dancingClassId, studentId)
                .ifPresent(this.enrollmentRepository::delete);
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

    /**
     * Progresses a class: finalizes the current one and creates a new class with the same
     * structure (beat, day, schedules) and new level/dates, replicating all enrollments.
     * Atomic operation; rolls back on any failure.
     */
    @Transactional(rollbackFor = Exception.class)
    public DancingClass progressClass(Long classId, ProgressClassDto dto) {
        DancingClass current = this.findById(classId);
        if (current.getStatus() == StatusDancingEnum.COMPLETED || current.getStatus() == StatusDancingEnum.CANCELED) {
            throw new IllegalStateException("Turma já está finalizada ou cancelada e não pode ser progredida.");
        }
        if (dto.endDate() == null || dto.startDate() == null || !dto.endDate().isAfter(dto.startDate())) {
            throw new IllegalArgumentException("Data de fim deve ser posterior à data de início.");
        }

        current.setStatus(StatusDancingEnum.COMPLETED);
        this.dancingClassRepository.save(current);

        DancingClass newClass = new DancingClass();
        newClass.setLevel(dto.newLevel());
        newClass.setStatus(StatusDancingEnum.IN_PROGRESS);
        newClass.setDayWeek(current.getDayWeek());
        newClass.setStartSchedule(current.getStartSchedule());
        newClass.setEndSchedule(current.getEndSchedule());
        newClass.setStartDate(dto.startDate());
        newClass.setEndDate(dto.endDate());
        newClass.setBeat(current.getBeat());
        newClass.setDeleted(false);
        newClass.setArchived(false);
        newClass = this.dancingClassRepository.save(newClass);
        final Long newClassId = newClass.getId();

        List<DancingClassEnrollment> currentEnrollments = current.getEnrollments();
        if (currentEnrollments != null && !currentEnrollments.isEmpty()) {
            for (DancingClassEnrollment en : currentEnrollments) {
                if (en.getStudent() == null) continue;
                DancingClassEnrollment newEnrollment = new DancingClassEnrollment();
                newEnrollment.setId(new EnrollmentId(newClassId, en.getStudent().getId()));
                newEnrollment.setDancingClass(newClass);
                newEnrollment.setStudent(en.getStudent());
                newEnrollment.setRole(en.getRole() != null ? en.getRole() : "CONDUCTED");
                this.enrollmentRepository.save(newEnrollment);
            }
        }

        this.entityManager.flush();
        this.entityManager.clear();
        return this.findById(newClassId);
    }

}
