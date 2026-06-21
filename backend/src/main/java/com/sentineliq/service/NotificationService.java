package com.sentineliq.service;

import com.sentineliq.model.Notification;
import com.sentineliq.model.User;
import com.sentineliq.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Transactional
    public Notification sendNotification(User recipient, String message) {
        Notification notification = Notification.builder()
                .recipient(recipient)
                .message(message)
                .readStatus(false)
                .build();

        notification = notificationRepository.save(notification);

        // Broadcast to WebSocket path unique to user (for ease of subscription)
        String destination = "/topic/notifications/user-" + recipient.getId();
        try {
            messagingTemplate.convertAndSend(destination, notification);
        } catch (Exception e) {
            // Log and bypass websocket failure if clients aren't connected yet
            System.err.println("Failed to send websocket notification: " + e.getMessage());
        }

        return notification;
    }
}
