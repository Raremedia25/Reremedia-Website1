package com.raremedia.api;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class ContactMailService {

  private final JavaMailSender mailSender;
  private final String companyInbox;
  private final String fromAddress;

  public ContactMailService(
      JavaMailSender mailSender,
      @Value("${raremedia.company-inbox}") String companyInbox,
      @Value("${spring.mail.username}") String fromAddress) {
    this.mailSender = mailSender;
    this.companyInbox = companyInbox;
    this.fromAddress = fromAddress;
  }

  /**
   * Sends two emails per submission:
   * 1. A notification to the RAREMEDIA inbox with the client's details
   *    (reply-to set to the client, so "Reply" answers them directly).
   * 2. A short acknowledgment to the client so they know we received it.
   * The acknowledgment is best-effort: a bad client address must not make
   * the submission fail after the notification was already delivered.
   */
  public void sendContactEmails(ContactController.ContactRequest request) {
    SimpleMailMessage notification = new SimpleMailMessage();
    notification.setFrom(fromAddress);
    notification.setTo(companyInbox);
    notification.setReplyTo(request.email());
    notification.setSubject("New service request — " + request.service() + " — " + request.fullName());
    notification.setText("""
        New contact request from the RAREMEDIA website:

        Name:     %s
        Email:    %s
        Phone:    %s
        Company:  %s
        Service:  %s

        Message:
        %s
        """.formatted(
        request.fullName(),
        request.email(),
        request.phone(),
        request.company() == null || request.company().isBlank() ? "—" : request.company(),
        request.service(),
        request.message()));
    mailSender.send(notification);

    SimpleMailMessage acknowledgment = new SimpleMailMessage();
    acknowledgment.setFrom(fromAddress);
    acknowledgment.setTo(request.email());
    acknowledgment.setSubject("We received your request — RAREMEDIA");
    acknowledgment.setText("""
        Dear %s,

        Thank you for contacting RAREMEDIA. We have received your request
        regarding "%s" and our team will get back to you as soon as possible,
        usually within one business day.

        Your message:
        %s

        Best regards,
        The RAREMEDIA Team
        %s | %s
        """.formatted(
        request.fullName(),
        request.service(),
        request.message(),
        companyInbox,
        "+250 781 425 110"));
    try {
      mailSender.send(acknowledgment);
    } catch (Exception ignored) {
      // Notification already reached the company inbox — never fail the
      // submission because the client's mailbox rejected the acknowledgment.
    }
  }
}
