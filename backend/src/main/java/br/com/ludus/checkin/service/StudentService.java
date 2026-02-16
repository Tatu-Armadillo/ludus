package br.com.ludus.checkin.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import br.com.ludus.checkin.model.Student;
import br.com.ludus.checkin.repository.StudentRepository;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;

    public Student create(Student entity) {
        entity.setContact(entity.getContact().replaceAll("[.,(){}\\s\\[\\]\\-/]", ""));
        entity.setCpf(entity.getCpf().replaceAll("[.,(){}\\s\\[\\]\\-/]", ""));
        entity.setEnrollmentDate(LocalDate.now());
        return this.studentRepository.save(entity);
    }

    public List<Student> findAllStudents(Pageable pageable) {
        return this.studentRepository.findAll(pageable).toList();
    }
    
    public List<Student> findAllStudentsByDancingClass(Pageable pageable, Long id) {
        return this.studentRepository.findStudentsByDancingClassId(pageable, id).toList();
    }

    public void delete(Long id) {
        this.studentRepository.deleteById(id);
    }

    public Student findById(Long id) {
        return this.studentRepository.findById(id).orElseThrow();
    }

    public List<Student> findAllById(List<Long> ids) {
        return this.studentRepository.findAllById(ids);
    }

}
