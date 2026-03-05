package br.com.ludus.checkin.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(name = "whatsapp.twilio.enabled", havingValue = "false", matchIfMissing = true)
public class NoopWhatsAppService implements WhatsAppService {

    private static final Logger LOGGER = LoggerFactory.getLogger(NoopWhatsAppService.class);

    @Override
    public void sendMessage(String phone, String message) {
        LOGGER.info("WhatsApp mock send to {}: {}", phone, message);
    }
}
