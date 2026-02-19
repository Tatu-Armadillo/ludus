package br.com.ludus.checkin.dto.student;

import java.time.LocalDate;

import br.com.ludus.checkin.model.Student;

public record StudentCreateDto(
        String name,
        String contact,
        String cpf,
        LocalDate birth,
        String email,
        String gender) {

    public Student toEntity() {
        final var entity = new Student();
        entity.setName(this.name);
        entity.setContact(this.contact);
        entity.setCpf(this.cpf);
        entity.setActive(true);
        entity.setBirth(this.birth);
        entity.setEmail(this.email);
        entity.setGender(this.gender);
        return entity;
    }

}
