package com.mini_jenkin.security;

import com.mini_jenkin.dto.UserDto;
import com.mini_jenkin.entity.User;
import com.mini_jenkin.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findUserByEmail(email).orElseThrow(() -> new UsernameNotFoundException("User not found with email " + email));
        return User.builder().userId(user.getUserId()).email(user.getEmail()).password(user.getPassword()).name(user.getName()).build();
    }
}
