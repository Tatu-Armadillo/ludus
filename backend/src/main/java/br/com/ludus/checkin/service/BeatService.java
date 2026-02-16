package br.com.ludus.checkin.service;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import br.com.ludus.checkin.model.Beat;
import br.com.ludus.checkin.repository.BeatRepository;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class BeatService {

    private final BeatRepository beatRepository;

    public Beat create(String name) {
        return this.beatRepository.save(Beat.of(name));
    }

    public List<Beat> findAll(Pageable pageable) {
        return this.beatRepository.findAll(pageable).getContent();
    }

    public Beat findById(Long id) {
        return this.beatRepository.findById(id).orElseThrow();
    }

    public void delete(Long id) {
        this.beatRepository.deleteById(id);
    }

}
