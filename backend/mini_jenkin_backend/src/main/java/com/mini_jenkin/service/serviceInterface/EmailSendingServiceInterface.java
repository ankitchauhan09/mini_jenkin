package com.mini_jenkin.service.serviceInterface;

import com.mini_jenkin.payload.MailObject;

public interface EmailSendingServiceInterface {
    String sendEmail(MailObject mailObject);
}
