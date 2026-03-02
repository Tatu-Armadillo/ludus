package br.com.ludus.checkin.controller;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import br.com.ludus.checkin.dto.student.StudentCreateDto;
import br.com.ludus.checkin.dto.student.StudentUpdateDto;
import br.com.ludus.checkin.model.Student;
import br.com.ludus.checkin.service.StudentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;

@Tag(name = "Student", description = "Endpoints for Managing Student")
@AllArgsConstructor
@SecurityRequirement(name = "bearer-key")
@RestController
@RequestMapping("/student")
public class StudentController {

    private final StudentService studentService;

    @Operation(tags = { "Student" }, summary = "Create a new Student")
    @PostMapping
    @Transactional
    public ResponseEntity<Student> create(@RequestBody final StudentCreateDto data) {
        final var response = this.studentService.create(data.toEntity());
        return ResponseEntity.ok(response);
    }

    @Operation(tags = { "Student" }, summary = "Update Student")
    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<Student> update(@PathVariable Long id, @RequestBody final StudentUpdateDto data) {
        final var entity = this.studentService.findById(id);
        entity.setName(data.name());
        entity.setContact(data.contact());
        entity.setBirth(data.birth());
        entity.setEmail(data.email());
        final var response = this.studentService.update(entity);
        return ResponseEntity.ok(response);
    }

    @Operation(tags = { "Student" }, summary = "Find all ")
    @GetMapping
    public ResponseEntity<List<Student>> showAllStudents(
            @PageableDefault(sort = "name", direction = Direction.ASC) Pageable pageable,
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "limit", required = false) Integer limit) {
        final int size = (limit != null && limit > 0) ? limit : pageable.getPageSize();
        final var effectivePageable = PageRequest.of(pageable.getPageNumber(), size, pageable.getSort());
        final var response = this.studentService.findAllStudents(effectivePageable, search);
        return ResponseEntity.ok(response);
    }

    @Operation(tags = { "Student" }, summary = "Find all Students enrollment in dancing class")
    @GetMapping("/dancing-class")
    public ResponseEntity<List<Student>> showAllStudents(
            @PageableDefault(sort = "name", direction = Direction.ASC) Pageable pageable,
            @RequestParam(name = "id", required = true) Long id) {
        final var response = this.studentService.findAllStudentsByDancingClass(pageable, id);
        return ResponseEntity.ok(response);
    }

    @Operation(tags = { "Student" }, summary = "Remove student")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        this.studentService.delete(id);
        return ResponseEntity.ok().build();
    }

}
