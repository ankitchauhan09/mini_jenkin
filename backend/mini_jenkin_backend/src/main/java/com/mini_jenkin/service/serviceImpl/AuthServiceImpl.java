package com.mini_jenkin.service.serviceImpl;

import com.mini_jenkin.dto.UserDto;
import com.mini_jenkin.entity.User;
import com.mini_jenkin.exception.InvalidCredentialException;
import com.mini_jenkin.exception.UserAlreadyExists;
import com.mini_jenkin.payload.AuthResponse;
import com.mini_jenkin.payload.LoginRequest;
import com.mini_jenkin.repository.UserRepository;
import com.mini_jenkin.security.CustomUserDetailService;
import com.mini_jenkin.security.jwt.JwtUtil;
import com.mini_jenkin.service.serviceInterface.AuthServiceInterface;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.filter.RequestContextFilter;

import java.util.UUID;

@Service
@Slf4j
public class AuthServiceImpl implements AuthServiceInterface {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private CustomUserDetailService userDetailsService;
    @Autowired
    private RequestContextFilter requestContextFilter;

    @Override
    public UserDto registerUser(User user) {
        System.out.println("registering user");
        try {
            if (userRepository.existsByEmail(user.getEmail())) {
                throw new UserAlreadyExists("USER WITH EMAIL : " + user.getEmail() + " already exists");
            }
            user.setUserId(UUID.randomUUID().toString());
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            userRepository.save(user);
            return modelMapper.map(user, UserDto.class);
        } catch (Exception e) {
            throw new InvalidCredentialException(e.getMessage());
        }
    }

    @Override
    public AuthResponse loginUser(@RequestBody LoginRequest request) {
        try {
            Authentication authentication = new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword());
            SecurityContextHolder.getContext().setAuthentication(authentication);
            UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
            User user = userRepository.findUserByEmail(request.getEmail()).orElseThrow(() -> new UsernameNotFoundException("USER NOT FOUND"));
            String token = jwtUtil.generateToken(request.getEmail(), userDetails, user);
            return AuthResponse.builder().token(token).user(modelMapper.map(user, UserDto.class)).build();
        } catch (BadCredentialsException e) {
            throw new InvalidCredentialException("Invalid email or password");
        }
    }
}
