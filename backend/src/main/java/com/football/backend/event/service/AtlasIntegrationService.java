package com.football.backend.event.service;

import com.football.backend.event.dto.AtlasRequestDto;
import com.football.backend.event.dto.AtlasResponseDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.football.backend.event.model.BioMeasurement;
import com.football.backend.event.repository.BioMeasurementRepository;
import com.football.backend.player.model.Player;
import com.football.backend.player.repository.PlayerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import org.springframework.http.*;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Base64;


import org.springframework.transaction.annotation.Transactional;

@Service
public class AtlasIntegrationService {
    @Autowired
    private BioMeasurementRepository bioMeasurements;
    @Autowired
    private PlayerRepository players;

    private final RestTemplate restTemplate = new RestTemplate();

    public AtlasIntegrationService(BioMeasurementRepository bioMeasurements,PlayerRepository players){
        this.bioMeasurements=bioMeasurements;
        this.players=players;
    }

    @Transactional
    public String calculateAndSaveMetrics(Long playerId, Long currentMeasureId ) {
        try {
            List<BioMeasurement> history = bioMeasurements.findAllByPlayerIdOrderByEventDateDesc(playerId);
            if (history.size() < 2) {
                return null;
            }
            BioMeasurement newestMeasure = history.get(0);
            BioMeasurement olderMeasure = history.get(1);

            Player player = players.findById(playerId).orElseThrow();

            // 1. Форматируем дату рождения (если она есть) в формат "dd.MM.yyyy", иначе заглушка
            String birthDateStr = player.getBirthDate() != null ?
                    player.getBirthDate().format(DateTimeFormatter.ofPattern("dd.MM.yyyy")) : "01.01.2010";

            // 2. Создаем первый (старый) замер
            String oldDate = olderMeasure.getEvent() != null ?
                    olderMeasure.getEvent().getDate().format(DateTimeFormatter.ofPattern("dd.MM.yyyy")) : "01.01.2023";
                    
            AtlasRequestDto.AtlasMeasurementDto oldData = new AtlasRequestDto.AtlasMeasurementDto(
                    oldDate, 
                    olderMeasure.getHeight(), 
                    olderMeasure.getSittingHeight(), 
                    olderMeasure.getWeight()
            );

            // 3. Создаем второй (свежий) замер
            String newDate = newestMeasure.getEvent() != null ?
                    newestMeasure.getEvent().getDate().format(DateTimeFormatter.ofPattern("dd.MM.yyyy")) : "02.01.2023";
                    
            AtlasRequestDto.AtlasMeasurementDto newData = new AtlasRequestDto.AtlasMeasurementDto(
                    newDate, 
                    newestMeasure.getHeight(), 
                    newestMeasure.getSittingHeight(), 
                    newestMeasure.getWeight()
            );

            // 4. Пакуем это в Игрока (+ подставляем "M" как пол, и берем рост из профиля игрока или замера)
            AtlasRequestDto.AtlasPlayerDto playerObj = new AtlasRequestDto.AtlasPlayerDto(
                    birthDateStr,
                    "M",
                    player.getMotherHeight() != null ? player.getMotherHeight() : (newestMeasure.getMotherHeight() != null ? newestMeasure.getMotherHeight() : 165),
                    player.getFatherHeight() != null ? player.getFatherHeight() : (newestMeasure.getFatherHeight() != null ? newestMeasure.getFatherHeight() : 180),
                    List.of(oldData, newData) // Кладем 2 замера в массив
            );

            // 5. Пакуем Игрока НАПРЯМУЮ В МАССИВ, т.к. API ждет [ { ... } ]
            List<AtlasRequestDto.AtlasPlayerDto> requestObj = List.of(playerObj);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String plainCreds = "user_n4v8q:e6w38I3LeMP2k2Bw";
            String base64Creds = Base64.getEncoder().encodeToString(plainCreds.getBytes());
            headers.add("Authorization", "Basic " + base64Creds);

            // 6. Отправляем наш готовый массив requestObj, и просим Spring СРАЗУ вернуть AtlasResponseDto
            HttpEntity<List<AtlasRequestDto.AtlasPlayerDto>> request = new HttpEntity<>(requestObj, headers);
            
            ResponseEntity<AtlasResponseDto> response = restTemplate.postForEntity(
                    "https://api.atlasltad.com/v1/calc/metrics/",
                    request,
                    AtlasResponseDto.class // <-- Spring (через Jackson) САМ распарсит JSON в объект
            );

            // 7. Разбираем ответ и сохраняем его в нашу БД
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                AtlasResponseDto parsedDto = response.getBody();

                if (parsedDto.isSuccess() && parsedDto.getResult() != null && !parsedDto.getResult().isEmpty()) {
                    System.out.println("Atlas API ответ успешно получен и распарсен автоматически!");
                }

                ObjectMapper mapper = new ObjectMapper();
                String rawJsonToSave = mapper.writeValueAsString(parsedDto);
                
                newestMeasure.setApiResponse(rawJsonToSave);
                bioMeasurements.save(newestMeasure);
                return rawJsonToSave;
            }
        }
        catch(Exception e) {
            System.err.println("Ошибка при интеграции с Atlas API: " + e.getMessage());
        }
        return null;
    }
}
