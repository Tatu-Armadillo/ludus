package br.com.ludus.checkin.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.ludus.checkin.dto.dancing.ClassStatusDto;
import br.com.ludus.checkin.dto.dancing.DancingClassCreateDto;
import br.com.ludus.checkin.enums.StatusDancingEnum;
import br.com.ludus.checkin.model.DancingClass;
import br.com.ludus.checkin.repository.DancingClassRepository;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class DancingClassService {

    private final DancingClassRepository dancingClassRepository;
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

    public DancingClass registerStudents(Long dancingId, List<Long> studentIds) {
        final var dancingClass = this.findById(dancingId);
        final var students = this.studentService.findAllById(studentIds);

        if (dancingClass.getStudents() == null) {
            dancingClass.setStudents(new ArrayList<>());
        }

        dancingClass.getStudents().addAll(students);

        return this.dancingClassRepository.save(dancingClass);
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
        final int remainingLessons = dc.getLessons() != null
                ? (int) dc.getLessons().stream().filter(l -> l.getDay() != null && !l.getDay().isBefore(today)).count()
                : 0;
        final var status = dc.getStatus() != null ? dc.getStatus().name() : StatusDancingEnum.IN_PROGRESS.name();
        return new ClassStatusDto(dc.getId(), name, endDate, remainingLessons, status);
    }

}
