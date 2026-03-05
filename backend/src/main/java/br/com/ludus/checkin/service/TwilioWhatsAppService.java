package br.com.ludus.checkin.service;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@ConditionalOnProperty(name = "whatsapp.twilio.enabled", havingValue = "true")
public class TwilioWhatsAppService implements WhatsAppService {

    private static final Logger LOGGER = LoggerFactory.getLogger(TwilioWhatsAppService.class);

    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Value("${whatsapp.twilio.account-sid}")
    private String accountSid;

    @Value("${whatsapp.twilio.auth-token}")
    private String authToken;

    @Value("${whatsapp.twilio.from-number}")
    private String fromNumber;

    @Override
    public void sendMessage(String phone, String message) {
        if (isBlank(accountSid) || isBlank(authToken) || isBlank(fromNumber)) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Twilio não configurado corretamente.");
        }

        String from = toWhatsAppAddress(fromNumber);
        String to = toWhatsAppAddress(phone);
        String form = "From=" + encode(from) + "&To=" + encode(to) + "&Body=" + encode(message);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.twilio.com/2010-04-01/Accounts/" + accountSid + "/Messages.json"))
                .header("Authorization", basicAuth(accountSid, authToken))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(form))
                .build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                LOGGER.error("Twilio error status={} body={}", response.statusCode(), response.body());
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Falha ao enviar mensagem no Twilio.");
            }
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Erro de comunicação com Twilio.");
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Erro de comunicação com Twilio.");
        }
    }

    private String toWhatsAppAddress(String phone) {
        String raw = phone == null ? "" : phone.trim();
        String digits = raw.replaceAll("\\D", "");
        if (digits.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Telefone inválido para WhatsApp.");
        }

        if (raw.startsWith("+")) {
            return "whatsapp:+" + digits;
        }

        if (digits.length() <= 11 && !digits.startsWith("55")) {
            digits = "55" + digits;
        }
        return "whatsapp:+" + digits;
    }

    private String basicAuth(String user, String pass) {
        String raw = user + ":" + pass;
        return "Basic " + Base64.getEncoder().encodeToString(raw.getBytes(StandardCharsets.UTF_8));
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
