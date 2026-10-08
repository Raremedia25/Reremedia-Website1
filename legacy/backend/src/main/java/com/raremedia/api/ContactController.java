package com.raremedia.api;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

  private static final Logger log = LoggerFactory.getLogger(ContactController.class);

  private final ContactMailService mailService;

  public ContactController(ContactMailService mailService) {
    this.mailService = mailService;
  }

  public record ContactRequest(
      @NotBlank(message = "Full name is required.") @Size(max = 120) String fullName,
      @NotBlank(message = "Email is required.") @Email(message = "Invalid email address.")
          @Size(max = 160) String email,
      @NotBlank(message = "Phone number is required.") @Size(max = 40) String phone,
      @Size(max = 160) String company,
      @NotBlank(message = "Service is required.") @Size(max = 120) String service,
      @NotBlank(message = "Message is required.") @Size(max = 5000) String message) {}

  @PostMapping
  public Map<String, Object> submit(@Valid @RequestBody ContactRequest request) {
    mailService.sendContactEmails(request);
    return Map.of("success", true);
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<Map<String, Object>> onValidationError(MethodArgumentNotValidException e) {
    String message = e.getBindingResult().getFieldErrors().stream()
        .findFirst()
        .map(err -> err.getDefaultMessage())
        .orElse("Invalid request.");
    return ResponseEntity.badRequest().body(Map.of("success", false, "error", message));
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<Map<String, Object>> onError(Exception e) {
    log.error("Contact form submission failed", e);
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(Map.of("success", false, "error", "Could not send the message. Please try again."));
  }
}
