package org.acme.dto;

public record AuthResponse(String token, UserDto user) {}
