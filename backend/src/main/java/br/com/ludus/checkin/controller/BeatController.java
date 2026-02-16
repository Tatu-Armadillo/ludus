package br.com.ludus.checkin.controller;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import br.com.ludus.checkin.model.Beat;
import br.com.ludus.checkin.service.BeatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;

@Tag(name = "Beat", description = "Endpoints for Managing Beat")
@AllArgsConstructor
@SecurityRequirement(name = "bearer-key")
@RestController
@RequestMapping("/beat")
public class BeatController {

    private final BeatService beatService;

    @Operation(tags = { "Beat" }, summary = "Create a new Beat")
    @PostMapping
    @Transactional
    public ResponseEntity<Beat> create(@RequestBody final String data) {
        final var response = this.beatService.create(data);
        return ResponseEntity.ok(response);
    }

    @Operation(tags = { "Beat" }, summary = "Find all beats")
    @GetMapping
    public ResponseEntity<List<Beat>> showBeats(
            @PageableDefault(sort = "name", direction = Direction.ASC) Pageable pageable) {
        final var response = this.beatService.findAll(pageable);
        return ResponseEntity.ok(response);
    }

    @Operation(tags = { "Beat" }, summary = "Remove beat")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        this.beatService.delete(id);
        return ResponseEntity.ok().build();
    }

}
