package com.football.backend.common.config;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
@Profile("dev")
public class DevDatabaseFixes {

    @Bean
    public ApplicationRunner devFixEventTypeConstraint(JdbcTemplate jdbcTemplate) {
        return args -> {
            // Postgres CHECK constraint created earlier for enum-like column values.
            // JPA ddl-auto=update doesn't update CHECK constraints, so we patch it in DEV only.
            try {
                jdbcTemplate.execute("ALTER TABLE events DROP CONSTRAINT IF EXISTS events_type_check");
            } catch (Exception ignored) {
                // Intentionally ignored (constraint may not exist / insufficient privileges).
            }

            try {
                jdbcTemplate.execute(
                        "ALTER TABLE events " +
                                "ADD CONSTRAINT events_type_check " +
                                "CHECK (type IN ('TRAINING', 'MATCH', 'BIO'))"
                );
            } catch (Exception ignored) {
                // Intentionally ignored (constraint may already exist or differ).
            }
        };
    }
}

