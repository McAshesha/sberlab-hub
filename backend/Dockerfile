# Multi-stage build for Quarkus backend
FROM maven:3.9-eclipse-temurin-25-noble AS builder

WORKDIR /app

# Copy pom.xml first for dependency caching
COPY pom.xml .
COPY .mvn .mvn

# Download dependencies (cached layer)
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN mvn package -DskipTests -B

# Runtime stage
FROM eclipse-temurin:25-jre-noble

WORKDIR /app

# Copy the built application
COPY --from=builder /app/target/quarkus-app/lib/ /app/lib/
COPY --from=builder /app/target/quarkus-app/*.jar /app/
COPY --from=builder /app/target/quarkus-app/app/ /app/app/
COPY --from=builder /app/target/quarkus-app/quarkus/ /app/quarkus/

EXPOSE 8080

# Run with required Java 25 preview features
CMD ["java", "--enable-preview", "--add-modules", "jdk.incubator.vector", "-Dquarkus.http.host=0.0.0.0", "-jar", "/app/quarkus-run.jar"]
