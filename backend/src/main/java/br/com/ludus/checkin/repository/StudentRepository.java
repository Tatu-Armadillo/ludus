package br.com.ludus.checkin.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.com.ludus.checkin.model.Student;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

        @Override
        @Modifying
        @Query("UPDATE Student s SET s.deleted = true WHERE s.id = :id")
        void deleteById(@Param("id") Long id);

        @Query("""
                        SELECT s
                        FROM Student s
                        JOIN s.dancingClasses dc
                        WHERE dc.id = :dancingClassId
                        """)
        Page<Student> findStudentsByDancingClassId(Pageable pageable, @Param("dancingClassId") Long dancingClassId);

}
