package br.com.ludus.checkin.controller;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import br.com.ludus.checkin.dto.dancing.ClassStatusDto;
import br.com.ludus.checkin.dto.dancing.DancingClassCreateDto;
import br.com.ludus.checkin.dto.dancing.HowManyLessonsDto;
import br.com.ludus.checkin.dto.dancing.RegisterStudentsDto;
import br.com.ludus.checkin.model.DancingClass;
import br.com.ludus.checkin.service.DancingClassService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;

@Tag(name = "Dancing-Class", description = "Endpoints for Managing dancing class")
@AllArgsConstructor
@SecurityRequirement(name = "bearer-key")
@RestController
@RequestMapping("/dancing-class")
public class DancingClassController {

    private final DancingClassService dancingClassService;

    @Operation(tags = { "Dancing-Class" }, summary = "Create a new dancing class")
    @PostMapping
    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<DancingClass> create(@RequestBody final DancingClassCreateDto data) {
        final var response = this.dancingClassService.create(data);
        return ResponseEntity.ok(response);
    }

    @Operation(tags = { "Dancing-Class" }, summary = "Register students in dancing class")
    @PatchMapping("/students")
    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<DancingClass> registerStudents(@RequestBody final RegisterStudentsDto data) {
        final var response = this.dancingClassService.registerStudents(data.dancingClassId(), data.enrollments());
        return ResponseEntity.ok(response);
    }

    @Operation(tags = { "Dancing-Class" }, summary = "Remove student from dancing class")
    @DeleteMapping("/{classId}/students/{studentId}")
    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<Void> removeStudentFromClass(
            @PathVariable Long classId,
            @PathVariable Long studentId) {
        this.dancingClassService.removeStudentFromClass(classId, studentId);
        return ResponseEntity.ok().build();
    }

    @Operation(tags = { "Dancing-Class" }, summary = "Remove Dancing-class")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        this.dancingClassService.delete(id);
        return ResponseEntity.ok().build();
    }

    @Operation(tags = { "Dancing-Class" }, summary = "Find all dancing class")
    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<DancingClass>> showAllDancingClass(
            @PageableDefault(sort = "beat.name", direction = Direction.ASC, size = 500) Pageable pageable,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String dayWeek,
            @RequestParam(required = false) String beatName) {
        final var l = (level != null && !level.isBlank()) ? level.trim() : null;
        final var s = (status != null && !status.isBlank()) ? status.trim() : null;
        final var d = (dayWeek != null && !dayWeek.isBlank()) ? dayWeek.trim() : null;
        final var b = (beatName != null && !beatName.isBlank()) ? beatName.trim() : null;
        final var response = this.dancingClassService.findAll(pageable, l, s, d, b);
        return ResponseEntity.ok(response);
    }

    @Operation(tags = { "Dancing-Class" }, summary = "Return how many lessons are left by dancing-class")
    @GetMapping("/how-many")
    public ResponseEntity<List<HowManyLessonsDto>> howManyLessonsAreLeft() {
        final var response = this.dancingClassService.findHowManyLessonsAreLeft()
                .stream()
                .map(HowManyLessonsDto::toDto)
                .toList();
        return ResponseEntity.ok(response);
    }

    @Operation(tags = { "Dancing-Class" }, summary = "List classes for dashboard status (in progress + recently closed)")
    @GetMapping("/status")
    public ResponseEntity<List<ClassStatusDto>> getClassesStatus() {
        return ResponseEntity.ok(this.dancingClassService.findAllForStatusDashboard());
    }

}
