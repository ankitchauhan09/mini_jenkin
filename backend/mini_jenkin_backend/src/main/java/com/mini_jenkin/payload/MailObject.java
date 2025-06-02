package com.mini_jenkin.payload;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// Annotations
@Data
@AllArgsConstructor
@NoArgsConstructor

@Builder
// Class
public class MailObject {

    // Class data members
    private String recipient;
    private String msgBody;
    private String subject;
    private String attachment;
}
