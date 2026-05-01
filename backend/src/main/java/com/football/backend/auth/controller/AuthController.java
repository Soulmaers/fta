package com.football.backend.auth.controller;
import com.football.backend.auth.dto.*;
import com.football.backend.auth.model.RefreshToken;
import com.football.backend.auth.model.User;
import com.football.backend.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;





@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService){
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterManagerRequest req) {

        System.out.println("тут ведь?");
        AuthResponse entity=authService.register(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(entity);
    }
    @PostMapping("/forgot-password")
    public String forgotPassword(
            @RequestBody ForgotPasswordRequest req
    ) {
        System.out.println("запрос логина");
        String token=authService.forgotPassword(req);
        return token;
    }
    @PostMapping("/reset-password")
    public void resetPassword(
            @RequestBody ResetPasswordRequest req
    ) {
        authService.resetPassword(req);
    }

    @PostMapping("/sing-in")
    public ResponseEntity<AuthResponse> singIn(@RequestBody SingIn req){
        AuthResponse result=authService.singIn(req);

        RefreshToken refreshToken = authService.createRefreshToken(result.getId());

        String tokenValue = refreshToken.getToken();

        ResponseCookie cookie = ResponseCookie.from("refreshToken", tokenValue)
                .httpOnly(true)
                .secure(false) // true, если у тебя HTTPS (для локалки лучше false)
                .path("/")
                .maxAge(req.isRemember() ? 2592000 : -1) // 30 дней или сессия
                .build();
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE,
                cookie.toString()).body(result);
    }


    @PostMapping("/refresh") // со слэшем
    public ResponseEntity<AuthResponse> refresh(@CookieValue(name ="refreshToken", required=false) String token) {
        if (token == null) return ResponseEntity.status(401).build();
        AuthResponse response = authService.refresh(token);
        return ResponseEntity.ok(response); // с .ok()
    }

    @PostMapping("/impersonate/{id}")
    public ResponseEntity<AuthResponse> impersonate(@PathVariable Long id) {
        AuthResponse result = authService.impersonate(id);

        RefreshToken refreshToken = authService.createRefreshToken(result.getId());

        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken.getToken())
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(2592000)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(result);
    }
    @GetMapping("/users")
    public List<AuthResponse> users() {
        return authService.getAllUsers();
    }
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@CookieValue(name ="refreshToken", required=false) String token) {
        if (token != null) {
            authService.logout(token);
        }
        ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .path("/")
                .maxAge(0) // удаляем куку немедленно
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .build();
    }
}
