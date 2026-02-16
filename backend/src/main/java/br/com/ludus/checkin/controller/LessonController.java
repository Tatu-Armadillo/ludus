package br.com.ludus.checkin.controller;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import br.com.ludus.checkin.dto.lesson.LessonCreateDto;
import br.com.ludus.checkin.model.Lesson;
import br.com.ludus.checkin.service.LessonService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;

@Tag(name = "Lesson", description = "Endpoints for Managing Lessons")
@AllArgsConstructor
@SecurityRequirement(name = "bearer-key")
@RestController
@RequestMapping("/Lessons")
public class LessonController {

    private final LessonService lessonService;

    @Operation(tags = { "Lesson" }, summary = "Create a new lesson")
    @PostMapping
    @Transactional
    public ResponseEntity<Lesson> create(@RequestBody final LessonCreateDto data) {
        final var response = this.lessonService.create(data);
        return ResponseEntity.ok(response);
    }

    @Operation(tags = { "Lesson" }, summary = "Find all Lessons by dancing-class")
    @GetMapping
    public ResponseEntity<List<Lesson>> showAllLessonByDancinClass(
            @PageableDefault(sort = "day", direction = Direction.DESC) Pageable pageable,
            @RequestParam(name = "id", required = true) Long id) {
        final var response = this.lessonService.findAllByDancingClassId(pageable, id);
        return ResponseEntity.ok(response);
    }

    @Operation(tags = { "Lesson" }, summary = "Remove Lesson")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        this.lessonService.delete(id);
        return ResponseEntity.ok().build();
    }

}
