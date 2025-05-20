    package com.mini_jenkin.security.jwt;

    import com.mini_jenkin.entity.User;
    import io.jsonwebtoken.Claims;
    import io.jsonwebtoken.Jwts;
    import io.jsonwebtoken.security.Keys;
    import org.springframework.beans.factory.annotation.Value;
    import org.springframework.security.core.GrantedAuthority;
    import org.springframework.security.core.authority.SimpleGrantedAuthority;
    import org.springframework.security.core.userdetails.UserDetails;
    import org.springframework.stereotype.Component;

    import javax.crypto.SecretKey;
    import java.util.*;
    import java.util.function.Function;
    import java.util.stream.Collectors;

    @Component
    public class JwtUtil {

        private final String secretKey;

        public JwtUtil(@Value("${jwt.secret}") String secretKey) {
            if(secretKey.length() < 32) {  // For raw strings
                throw new IllegalArgumentException("Secret key too short");
            }
            this.secretKey = secretKey;
        }


        public String generateToken(String username, UserDetails userDetails, User user ) {
            Map<String, Object> claims = new HashMap<>();
            claims.put("roles", userDetails.getAuthorities().stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList()));
            return Jwts.builder()
                    .claims(claims)
                    .subject(username)
                    .claim("name", user.getName())
                    .claim("id", user.getUserId())
                    .issuedAt(new Date(System.currentTimeMillis()))
                    .expiration(new Date(System.currentTimeMillis() + 2 * 60 * 60 * 1000))
                    .signWith(getSecretKey())
                    .compact();
        }

        private SecretKey getSecretKey() {
            byte[] encodedKey = Base64.getDecoder().decode(secretKey);
            return Keys.hmacShaKeyFor(encodedKey);
        }

        public String extractUsername(String token) {
            return extractClaim(token, Claims::getSubject);
        }

        public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
            final Claims claims = extractAllClaims(token);
            return claimsResolver.apply(claims);
        }

        private Claims extractAllClaims(String token) {
            return Jwts.parser()
                    .verifyWith(getSecretKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        }

        public Collection<? extends GrantedAuthority> extractAuthorities(String token) {
            Claims claims = extractAllClaims(token);
            List<String> roles = claims.get("roles", List.class);
            return roles.stream()
                    .map(SimpleGrantedAuthority::new)
                    .collect(Collectors.toList());
        }

        public Boolean validateToken(String token, UserDetails userDetails) {
            final String username = extractUsername(token);
            return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
        }

        private Boolean isTokenExpired(String token) {
            return extractExpiration(token).before(new Date());
        }

        public Date extractExpiration(String token) {
            return extractClaim(token, Claims::getExpiration);
        }
    }