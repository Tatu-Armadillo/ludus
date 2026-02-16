package br.com.ludus.checkin.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import br.com.ludus.checkin.dto.lesson.LessonCreateDto;
import br.com.ludus.checkin.model.Lesson;
import br.com.ludus.checkin.repository.LessonRepository;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class LessonService {

    private final LessonRepository lessonRepository;
    private final DancingClassService dancingClassService;

    public Lesson create(LessonCreateDto dto) {
        final var entity = dto.toEntity();
        final var dance = this.dancingClassService.findById(dto.dancingClassId());
        entity.setDancingClass(dance);
        return this.lessonRepository.save(entity);
    }

    public int totalNumberOfClassesLeft(Long dancingId) {
        final var result = this.lessonRepository.findAllByDancingClassIdAndDayGreaterThanEqual(dancingId, LocalDate.now());
        return result.size();
    }

    public List<Lesson> findAllByDancingClassId(Pageable pageable, Long dancingId) {
        return this.lessonRepository.findAllByDancingClassId(pageable, dancingId).toList();
    }

    public void delete(Long id) {
        this.lessonRepository.deleteById(id);
    }

}
