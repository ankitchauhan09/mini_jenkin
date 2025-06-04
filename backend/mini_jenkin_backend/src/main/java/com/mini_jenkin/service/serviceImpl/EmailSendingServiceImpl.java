package com.mini_jenkin.service.serviceImpl;

import com.mini_jenkin.payload.MailObject;
import com.mini_jenkin.service.serviceInterface.EmailSendingServiceInterface;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailSendingServiceImpl implements EmailSendingServiceInterface {

    @Autowired
    private JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    private String sender;

    @Override
    public String sendEmail(MailObject mailObject) {
        try {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(sender);
            helper.setTo(mailObject.getRecipient());
            helper.setSubject(mailObject.getSubject());
            helper.setText(mailObject.getMsgBody(), true); // Set second parameter to true for HTML

            javaMailSender.send(mimeMessage);
            return "Email sent successfully to " + mailObject.getRecipient();
        } catch (Exception e) {
            e.printStackTrace();
            return "Error sending email: " + e.getMessage();
        }
    }
}