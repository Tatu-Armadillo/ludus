package br.com.ludus.checkin.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import br.com.ludus.checkin.dto.event.AddParticipantDto;
import br.com.ludus.checkin.dto.event.EventCreateDto;
import br.com.ludus.checkin.enums.EventStatusEnum;
import br.com.ludus.checkin.model.Event;
import br.com.ludus.checkin.service.EventService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;

@Tag(name = "Event", description = "Eventos extras (bailes, workshops)")
@AllArgsConstructor
@SecurityRequirement(name = "bearer-key")
@RestController
@RequestMapping("/event")
public class EventController {

    private final EventService eventService;

    @Operation(tags = { "Event" }, summary = "Listar todos os eventos")
    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<Event>> list() {
        return ResponseEntity.ok(eventService.findAll());
    }

    @Operation(tags = { "Event" }, summary = "Buscar evento por ID")
    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<Event> getById(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.findById(id));
    }

    @Operation(tags = { "Event" }, summary = "Criar evento")
    @PostMapping
    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<Event> create(@RequestBody EventCreateDto dto) {
        return ResponseEntity.ok(eventService.create(dto));
    }

    @Operation(tags = { "Event" }, summary = "Atualizar evento")
    @PutMapping("/{id}")
    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<Event> update(@PathVariable Long id, @RequestBody EventCreateDto dto) {
        return ResponseEntity.ok(eventService.update(id, dto));
    }

    @Operation(tags = { "Event" }, summary = "Atualizar apenas status do evento")
    @PatchMapping("/{id}/status")
    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<Event> updateStatus(@PathVariable Long id, @RequestParam EventStatusEnum status) {
        eventService.updateStatus(id, status);
        return ResponseEntity.ok(eventService.findById(id));
    }

    @Operation(tags = { "Event" }, summary = "Excluir evento")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        eventService.delete(id);
        return ResponseEntity.ok().build();
    }

    @Operation(tags = { "Event" }, summary = "Inscrever aluno no evento")
    @PostMapping("/{id}/participants")
    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<Event> addParticipant(@PathVariable Long id, @RequestBody AddParticipantDto dto) {
        if (dto.studentId() == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(eventService.addParticipant(id, dto.studentId()));
    }

    @Operation(tags = { "Event" }, summary = "Remover aluno do evento")
    @DeleteMapping("/{id}/participants/{studentId}")
    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<Event> removeParticipant(@PathVariable Long id, @PathVariable Long studentId) {
        return ResponseEntity.ok(eventService.removeParticipant(id, studentId));
    }
}
