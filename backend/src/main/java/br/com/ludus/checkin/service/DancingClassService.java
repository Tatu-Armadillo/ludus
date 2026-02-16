package br.com.ludus.checkin.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

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

}
