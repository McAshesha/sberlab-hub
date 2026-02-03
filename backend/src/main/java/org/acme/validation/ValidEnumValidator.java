package org.acme.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

public class ValidEnumValidator implements ConstraintValidator<ValidEnum, String> {

    private Set<String> validNames;
    private String allowedValues;

    @Override
    public void initialize(ValidEnum annotation) {
        var constants = annotation.enumClass().getEnumConstants();
        validNames = Arrays.stream(constants).map(Enum::name).collect(Collectors.toSet());
        allowedValues = validNames.stream().sorted().collect(Collectors.joining(", "));
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) {
            return true; // let @NotNull / @NotBlank handle nulls
        }
        if (validNames.contains(value)) {
            return true;
        }
        context.disableDefaultConstraintViolation();
        context.buildConstraintViolationWithTemplate("must be one of: " + allowedValues)
                .addConstraintViolation();
        return false;
    }
}
