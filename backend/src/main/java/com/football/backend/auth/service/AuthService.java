package com.football.backend.auth.service;
import com.football.backend.auth.dto.*;
import com.football.backend.auth.model.PasswordResetToken;
import com.football.backend.auth.model.RefreshToken;
import com.football.backend.auth.repository.PasswordResetTokenRepository;
import com.football.backend.auth.repository.RefreshTokenRepository;
import com.football.backend.coach.dto.CoachSummaryDto;
import com.football.backend.coach.model.CoachProfileType;
import com.football.backend.coach.repository.CoachRepository;
import com.football.backend.common.error.*;
import com.football.backend.player.dto.PlayerSummaryDto;
import com.football.backend.player.model.Player;
import com.football.backend.player.repository.PlayerRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;
import com.football.backend.auth.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.football.backend.auth.model.User;
import com.football.backend.auth.model.Role;
import com.football.backend.coach.model.Coach;

import java.time.Instant;
import java.util.Optional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthService {

private final UserRepository users;
private final CoachRepository coaches;
    private final PlayerRepository players;
private final PasswordEncoder encoder;
private final PasswordResetTokenRepository resetTokens;
    private final RefreshTokenRepository refreshTokens;


public AuthService(RefreshTokenRepository refreshTokens,UserRepository users, CoachRepository coaches, PlayerRepository players, PasswordEncoder encoder, PasswordResetTokenRepository resetTokens){
this.users=users;
this.coaches=coaches;
    this.players=players;
this.encoder=encoder;
        this.resetTokens=resetTokens;
        this.refreshTokens=refreshTokens;
}



private  AuthResponse toAuthResponse(User user, String accessToken){
    CoachSummaryDto coachDto = null;
    PlayerSummaryDto playerDto = null;

    if(user.getRole()==Role.MANAGER||user.getRole()==Role.COACH){
        Coach coach = coaches.findByUser(user)
                .orElse(null);
      if(coach!=null){
          coachDto=new CoachSummaryDto(coach);
      }
    }
    else{
        Player player = players.findByUser(user)
                .orElse(null);
        if (player != null) {
            playerDto=new PlayerSummaryDto(player);
                    }

    }
return new AuthResponse(accessToken,user.getLogin(),user.getId(),user.getRole(),user.isActivated(), coachDto,playerDto);
}

@Transactional
    public AuthResponse register(RegisterManagerRequest req){
        if (!req.getPassword().equals(req.getConfirmPassword())) {
           throw new PasswordMismatchException("Пароли не совпадают");
                  }

        Optional<User> existing = users.findByLogin(req.getLogin());

        if (existing.isPresent()) {

            User u=existing.get();
            if(u.isActivated()) {
                throw new LoginAlreadyTakenException("Такой логин уже есть");
            }
                       else{
                String hash = encoder.encode(req.getPassword());
                u.setPasswordHash(hash);
                u.setActivated(true);
                users.save(u);
                String token = java.util.UUID.randomUUID().toString();
                return toAuthResponse(u, token);
                                                    }
                    }
        else{
            String hash = encoder.encode(req.getPassword());
            User user=new User(req.getLogin(),hash, Role.MANAGER);
            user.setActivated(true);
            users.save(user);
            Coach coach= new Coach(user, CoachProfileType.MANAGER_PROFILE,null );
                  coaches.save(coach);
            String token = java.util.UUID.randomUUID().toString();
            return toAuthResponse(user, token);
        }


    }



    @Transactional
    public String forgotPassword(ForgotPasswordRequest req) {
        System.out.println(req.getLogin());
        User user = users.findByLogin(req.getLogin())
                .orElseThrow(() -> new UserNotFoundException("Пользователь не найден"));

        String tokenValue = java.util.UUID.randomUUID().toString();

        Instant expiresAt = Instant.now().plusSeconds(15 * 60); // 15 минут

        PasswordResetToken token =
                new PasswordResetToken(tokenValue, user, expiresAt);

        resetTokens.save(token);

        return tokenValue; // dev-режим
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest req){

        if (!req.getPassword().equals(req.getConfirmPassword())) {
            throw new PasswordMismatchException("Пароли не совпадают");
        }

        PasswordResetToken token = resetTokens.findByToken(req.getToken())
                .orElseThrow(() -> new InvalidResetTokenException("Токен недействителен"));

        if (!token.getExpiresAt().isAfter(Instant.now())) {
            throw new ResetTokenExpiredException("Срок жизни токена истек");
        }
        if (token.isUsed()) {
            throw new ResetTokenUsedException("Токен уже был использован");
        }
        User user = token.getUser();
        String newHash = encoder.encode(req.getPassword());
        user.setPasswordHash(newHash);
        token.markUsed();
        users.save(user);
        resetTokens.save(token);

    }

        public AuthResponse singIn(SingIn req){
            User user = users.findByLogin(req.getLogin())
                    .orElseThrow(() -> new UserNotFoundException("Неверный логин или пароль"));
            boolean ok=encoder.matches(req.getPassword(),user.getPasswordHash());
        System.out.println(ok);
            if(!ok){
                throw new UserNotFoundException("Неверный логин или пароль");
            }
            // Генерируем временный токен для ответа
            String accessToken = java.util.UUID.randomUUID().toString();
                   AuthResponse result=toAuthResponse(user,accessToken);
        return result;

    }

    @Transactional
    public RefreshToken createRefreshToken(Long userId) {
        User user = users.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("Пользователь не найден"));
        // (Опционально) Удаляем старые токены пользователя, чтобы они не копились
        refreshTokens.deleteByUser(user);
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(java.util.UUID.randomUUID().toString());
        refreshToken.setExpiryDate(Instant.now().plusSeconds(30 * 24 * 60 * 60)); // 30 дней в секундах
        return refreshTokens.save(refreshToken);
    }
    @Transactional
    public AuthResponse refresh(String tokenValue) {
        // 1. Ищем токен в базе
        RefreshToken token = refreshTokens.findByToken(tokenValue)
                .orElseThrow(() -> new InvalidRefreshTokenException("Refresh токен не найден"));
        // 2. Проверяем, не протух ли он
        if (token.getExpiryDate().isBefore(Instant.now())) {
            refreshTokens.delete(token);
            throw new InvalidRefreshTokenException("Срок действия Refresh токена истек. Войдите снова.");
        }
        // 3. Если всё ок — генерируем новый Access Token
        String newAccessToken = java.util.UUID.randomUUID().toString();
        // 4. Возвращаем новый ответ с профилем пользователя
        return toAuthResponse(token.getUser(), newAccessToken);
    }

    @Transactional(readOnly = true)
    public AuthResponse impersonate(Long userId) {
        User user = users.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("Пользователь не найден"));

        // Генерируем временный токен (UUID), как при обычном входе
        String accessToken = java.util.UUID.randomUUID().toString();
        return toAuthResponse(user, accessToken);
    }

    public List<AuthResponse> getAllUsers() {
        return users.findAll().stream()
                .map(u -> new AuthResponse(null, u.getLogin(), u.getId(), u.getRole(), u.isActivated(), null, null))
                .collect(Collectors.toList());
    }

    @Transactional
    public void logout(String tokenValue) {
        refreshTokens.findByToken(tokenValue).ifPresent(refreshTokens::delete);
    }
}



