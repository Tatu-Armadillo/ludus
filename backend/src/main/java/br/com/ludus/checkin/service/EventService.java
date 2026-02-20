package br.com.ludus.checkin.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.ludus.checkin.dto.event.EventCreateDto;
import br.com.ludus.checkin.enums.EventStatusEnum;
import br.com.ludus.checkin.model.Event;
import br.com.ludus.checkin.model.EventParticipant;
import br.com.ludus.checkin.model.EventParticipantId;
import br.com.ludus.checkin.model.Student;
import br.com.ludus.checkin.repository.EventParticipantRepository;
import br.com.ludus.checkin.repository.EventRepository;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final EventParticipantRepository eventParticipantRepository;
    private final StudentService studentService;

    @Transactional(readOnly = true)
    public List<Event> findAll() {
        return eventRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Event findById(Long id) {
        return eventRepository.findById(id).orElseThrow();
    }

    @Transactional(rollbackFor = Exception.class)
    public Event create(EventCreateDto dto) {
        Event entity = dto.toEntity();
        return eventRepository.save(entity);
    }

    @Transactional(rollbackFor = Exception.class)
    public Event update(Long id, EventCreateDto dto) {
        Event entity = findById(id);
        entity.setName(dto.name());
        entity.setEventDate(dto.eventDate());
        entity.setEventTime(dto.eventTime());
        boolean hasLimit = dto.hasMaxParticipants() != null
                ? dto.hasMaxParticipants()
                : Boolean.TRUE.equals(entity.getHasMaxParticipants());
        entity.setHasMaxParticipants(hasLimit);
        if (hasLimit && dto.maxParticipants() != null && dto.maxParticipants() > 0) {
            entity.setMaxParticipants(dto.maxParticipants());
        } else if (!hasLimit) {
            entity.setMaxParticipants(0);
        }
        if (dto.status() != null) {
            entity.setStatus(dto.status());
        }
        return eventRepository.save(entity);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateStatus(Long id, EventStatusEnum status) {
        Event entity = findById(id);
        entity.setStatus(status);
        eventRepository.save(entity);
    }

    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        eventRepository.deleteById(id);
    }

    /** Adiciona aluno ao evento. Impede duplicata e bloqueia se capacidade máxima ou evento finalizado. */
    @Transactional(rollbackFor = Exception.class)
    public Event addParticipant(Long eventId, Long studentId) {
        Event event = findById(eventId);
        if (event.getStatus() == EventStatusEnum.FINISHED) {
            throw new IllegalStateException("Evento já finalizado. Não é possível inscrever participantes.");
        }
        if (Boolean.TRUE.equals(event.getHasMaxParticipants())) {
            int current = event.getParticipants() != null ? event.getParticipants().size() : 0;
            if (current >= event.getMaxParticipants()) {
                throw new IllegalStateException("Evento atingiu a capacidade máxima de participantes.");
            }
        }
        if (eventParticipantRepository.findByEventIdAndStudentId(eventId, studentId).isPresent()) {
            throw new IllegalStateException("Aluno já está inscrito neste evento.");
        }
        Student student = studentService.findById(studentId);
        EventParticipant ep = new EventParticipant();
        ep.setId(new EventParticipantId(eventId, studentId));
        ep.setEvent(event);
        ep.setStudent(student);
        eventParticipantRepository.save(ep);
        return findById(eventId);
    }

    /** Remove aluno do evento. Permitido apenas se evento não estiver finalizado. */
    @Transactional(rollbackFor = Exception.class)
    public Event removeParticipant(Long eventId, Long studentId) {
        Event event = findById(eventId);
        if (event.getStatus() == EventStatusEnum.FINISHED) {
            throw new IllegalStateException("Evento finalizado. Não é possível remover participantes.");
        }
        eventParticipantRepository.findByEventIdAndStudentId(eventId, studentId)
                .ifPresent(eventParticipantRepository::delete);
        return findById(eventId);
    }
}
