package com.drmp.security;

import com.drmp.entity.User;
import com.drmp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Custom UserDetailsService Implementation
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.debug("Loading user by username: {}", username);
        
        User user;
        
        // Try to parse as user ID first, then try username
        try {
            Long userId = Long.parseLong(username);
            user = userRepository.findByIdWithRolesAndPermissions(userId)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + userId));
        } catch (NumberFormatException e) {
            // If not a number, treat as username
            user = userRepository.findByUsernameWithRolesAndPermissions(username)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
        }

        log.debug("User found: {}, roles: {}", user.getUsername(), user.getRoles().size());
        return UserPrincipal.create(user);
    }
}